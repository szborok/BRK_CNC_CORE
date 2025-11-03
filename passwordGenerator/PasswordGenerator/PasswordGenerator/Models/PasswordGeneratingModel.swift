//
//  Backend.swift
//  PasswordGenerator
//
//  Created by Sovi on 2023. 01. 09..
//

import SwiftUI

extension Int: Sequence {
	public func makeIterator() -> CountableRange<Int>.Iterator {
		return (0..<self).makeIterator()
	}
}


func createPsw(masterKey: String, domain: String) -> String {
	//TODO validatemasterkey
	let masterKey = stringToAscii(masterKey)
	let domain = stringToAscii(domain)
	let psw = mashup(masterKey, domain)
	
	return asciiToString(psw)
}


func createPsw2(masterKey: String, domain: String) -> String {
	//TODO validatemasterkey
	let masterKey = stringToAscii(masterKey)
	let domain = stringToAscii(domain)
	var psw = [Int]()
	
	if domain.count > masterKey.count {
		psw = mashupByDomain(password: masterKey, domain: domain) }
	else { psw = mashupByPassword(password: masterKey, domain: domain) }
	//let psw = mashup(masterKey, domain)
	
	return asciiToString(psw)
}


//String.stringToBinary
extension String {
	func stringToBinary() -> String {
		let st = self
		var result = ""
		for char in st.utf8 {
			var tranformed = String(char, radix: 2)
			while tranformed.count < 8 {
				tranformed = "0" + tranformed
			}
			let binary = "\(tranformed) "
			result.append(binary)
		}
		return result
	}
}


func stringToAscii(_ victim: String) -> Array<Int>{
	var res = [Int]()
	for each in victim {
		if each.isASCII == true {
			let eachInAscii = each.asciiValue
			res.append(Int(eachInAscii!))
		}
		else {
			print("Include a not ASCII character")
			break
		}
	}
	return res
}


func asciiToString(_ victim: Array<Int>) -> String {
	var resArray = [String]()
	for each in victim {
		let stringEach = String(UnicodeScalar(UInt8(each)))
		resArray.append(stringEach)
	}
	let resString = resArray.joined(separator: "")
	return resString
}



func mashup(_ indegredient1: Array<Int>, _ indegredient2: Array<Int>) -> Array<Int> {
	let result = zip(indegredient1, indegredient2).map { $0 + $1 }
	var dividedResult = [Int]()
	
	for each in result {
		dividedResult.append(each / 2)
	}
	return dividedResult
}


func mashupByDomain( password: Array<Int>, domain: Array<Int>) -> Array<Int> {
	var extendedPassword: [Int] = 	password
	let reversedPassword: [Int] = 	password.reversed()
	var counting: Int = 				0
	
	while extendedPassword.count < domain.count {
		extendedPassword.append(reversedPassword[counting])
		counting += 1
	}
	
	let resultArray = zip(domain, extendedPassword).map { $0 + $1 }
	var dividedResult = [Int]()
	
	for each in resultArray {
		dividedResult.append(each / 2)
	}
	return dividedResult
}


func mashupByPassword( password: Array<Int>, domain: Array<Int>) -> Array<Int> {
	var extendedDomain: [Int] = 	domain
	let reversedDomain: [Int] = 	domain.reversed()
	var counting: Int = 				0
	
	while extendedDomain.count < password.count {
		extendedDomain.append(reversedDomain[counting])
		counting += 1
	}
	
	let resultArray = zip(extendedDomain, password).map { $0 + $1 }
	var dividedResult = [Int]()
	
	for each in resultArray {
		dividedResult.append(each / 2)
	}
	return dividedResult
}

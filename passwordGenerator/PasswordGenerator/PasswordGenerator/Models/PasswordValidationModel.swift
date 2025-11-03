//
//  PasswordValidationModel.swift
//  PasswordGenerator
//
//  Created by Sovi on 2023. 01. 28..
//

import SwiftUI

func isPasswordGeneratePossible(website: String, masterkey: String) -> Bool {
	if isDomainValid(victim: website) == true &&
		isPasswordValid(victim: masterkey) == true {
		return true }
	else { return false }
		
		
}

func isDomainValid(victim: String) -> Bool {
	if victim.count < 1 {
		return false }
	else { return true }
}


func isPasswordValid(victim: String) -> Bool {
	if isLongEnough(victim: victim) != true {
		return false }
	if containsJustAsciiCharacters(victim: victim) != true {
		return false }
	
	else {return true}
}


func isLongEnough(victim: String) -> Bool {
	if victim.count < 8 {
		return false }
	else {
		return true }
}


func containsJustAsciiCharacters(victim: String) -> Bool {
	for letter in victim {
		if letter.asciiValue == nil {
			return false }
	}
	return true
}
	







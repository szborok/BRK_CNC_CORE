//
//  LogoView.swift
//  PasswordGenerator
//
//  Created by Sovi on 2023. 01. 27..
//

import SwiftUI

struct LogoView: View {
	var sizeOfLogo: CGFloat
	var brandName: String
	var motto: String
	
    var body: some View {
		VStack (alignment: .center) {
			Image(systemName: "smoke.fill")
				.foregroundColor(Color(Constants.Colors.BlackWhite))
				.font(.system(size: sizeOfLogo))
				.frame(width: sizeOfLogo, height: sizeOfLogo, alignment: .center)
				//.padding(.bottom, 10)
			
			Text(brandName)
				.foregroundColor(Color(Constants.Colors.BlackWhite))
				.font(.largeTitle)
				//.kerning(20)
				.padding(.bottom, -4)
			
			Text(motto)
				.foregroundColor(Color(Constants.Colors.BlackWhite))
				.font(.footnote)
				.fontWeight(.light)
				//.padding(.bottom, 60)
		}
    }
}







struct LogoView_Previews: PreviewProvider {
    static var previews: some View {
        LogoView(sizeOfLogo: 150, brandName: "SHADE", motto: "you'r local password manager")
    }
}

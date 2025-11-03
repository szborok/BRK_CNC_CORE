//
//  ContentView.swift
//  PasswordGenerator
//
//  Created by Sovi on 2022. 12. 24..
//

import SwiftUI



struct ContentView: View {
	@AppStorage("isDarkMode") var isDarkMode: Bool = 		true
	@State var isMasterkeyHidden: Bool = 				true
	@State var opacityOfPassword: Double = 				0		//100 visible, 0 not visible
	@State var isGenerateButtonPressed: Bool = 			false
	@State var isInfotabShowing: Bool = 				false
	
	@State var website: String = 						""
	@State var masterkey: String = 						""
	@State var password: String = 						""
	
	
	var body: some View {
		ZStack {
			MapBackgroundView(isDarkMode: $isDarkMode, isInfotabShowing: $isInfotabShowing)
			VStack {
				LogoView(sizeOfLogo: 130,
						 brandName: "S H A D E",
						 motto: "you'r local password manager")
				.frame(alignment: .top)
				.padding(.top, 30)
				
				Spacer()
				
				VStack {
					ZStack {
						FieldStyle()
						TextFieldView(website: $website)
					}
					
					ZStack {
						FieldStyle()
						SecuredFieldView(isMasterkeyHidden: $isMasterkeyHidden,
										 masterkey: $masterkey)
					}
				}
				.padding(.horizontal, 10)
				.padding(.top, -20)
				
				Spacer()
				
				PasswordViewNew(opacityOfPassword: $opacityOfPassword, password: $password)
				
				Spacer()
				
				GeneratePasswordButtonView(isDarkMode: $isDarkMode, opacityOfPassword: $opacityOfPassword, isGenerateButtonPressed: $isGenerateButtonPressed, website: $website, masterkey: $masterkey, password: $password)
				.frame(height: 60, alignment: .bottom)
				.padding(.bottom, 10)
				.padding(.horizontal, 10)
			}
		}
		.preferredColorScheme(isDarkMode ? .dark : .light)
	}
}

struct ContentView_Previews: PreviewProvider {

	static var previews: some View {
		ContentView()
		ContentView()
			.preferredColorScheme(.dark)
		
	}
}

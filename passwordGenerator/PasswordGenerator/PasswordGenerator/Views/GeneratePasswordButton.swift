//
//  GeneratePasswordButton.swift
//  PasswordGenerator
//
//  Created by Sovi on 2023. 01. 28..
//

import SwiftUI


// NEW START


struct GeneratePasswordButtonNew: View {
	@Binding var opacityOfPassword: Double
	@Binding var website: String
	@Binding var masterKey: String
	@Binding var password: String
	@Binding var isGeneratorButtonPressed: Bool
	
	var body: some View {
		Button(action: {
			password = createPsw2(masterKey: masterKey, domain: website)
			opacityOfPassword = 100
			isGeneratorButtonPressed = true
		})
		{
			ZStack {
				GeneratePasswordButtonStyleNew(blur: 0.0)
				Text("Generate Password")
					.font(.title3)
					.frame(width: 350, height: 50	, alignment: .center)
					.foregroundColor(Color.white)
				Image(systemName: "hand.tap")
					.font(.title3)
					.padding(.leading, 220)
					.foregroundColor(Color.white)
			}
		}
	}
}


struct DummyButtonNew: View {
	@Binding var isDarkMode: Bool
	
	var body: some View {
		Button(action: {
			
		})
		{
			ZStack {
				GeneratePasswordButtonStyleNew(blur: 0.3)
				Text("Generate Password")
					.font(.title3)
					.frame(width: 350, height: 50	, alignment: .center)
					.foregroundColor(Color(Constants.Colors.WhiteBlack))
			}
		}
	}
}


struct ResetButtonNew: View {
	@Binding var opacityOfPassword: Double
	@Binding var website: String
	@Binding var masterKey: String
	@Binding var password: String
	@Binding var isGenerateButtonPressed: Bool
	
	var body: some View {
		Button(action: {
			website = ""
			masterKey = ""
			password = ""
			opacityOfPassword = 0.0
			isGenerateButtonPressed = false
			
			
		})
		{
			ZStack {
				GeneratePasswordButtonStyleNew(blur: 0.0)
				Text("Reset")
					.font(.title3)
					.frame(width: 350, height: 50	, alignment: .center)
					.foregroundColor(Color.white)
				Image(systemName: "hand.tap")
					.font(.title3)
					.padding(.leading, 100)
					.foregroundColor(Color.white)
			}
		}
	}
}


struct PasswordViewNew: View {
	@Binding var opacityOfPassword: Double
	@Binding var password: String
	
	var body: some View {
		Text(password)
			//.padding(.bottom, 85)
			.foregroundColor(Color("LightGrayDarkGray"))
			.opacity(opacityOfPassword)
			.font(.title)
			.frame(height: 30, alignment: .center)
			.frame(maxWidth: .infinity)
	}
}


struct GeneratePasswordButtonStyleNew: View {
	var blur: CGFloat
	
	var body: some View {
		ZStack {
			Capsule()
				.fill(LinearGradient(gradient: Gradient(colors: [Color.purple, Color.blue]),startPoint: .topLeading, endPoint: .bottomTrailing))
				.frame(maxWidth: .infinity)
				.frame(height: 50, alignment: .center)
				//.padding(.horizontal, 10)
			Capsule()
				.fill(Color.white).opacity(blur)
				.frame(maxWidth: .infinity)
				.frame(height: 50, alignment: .center)
				//.padding(.horizontal, 10)
		}
			
	}
}


// NEW END








struct GeneratePasswordButton_Previews: PreviewProvider {
	static private var isDarkmodeTrue = Binding.constant(true)
	static private var isDarkmodeFalse = Binding.constant(false)
	static private var opacityOfPassword = Binding.constant(100.0)
	static private var website = Binding.constant("facebook")
	static private var masterKey = Binding.constant("qwerty00")
	static private var password = Binding.constant("sdkfhdskhs")
	static private var isGeneratorButtonPressed = Binding.constant(false)
	
	
    static var previews: some View {
		ZStack {
			Color.blue
			
			VStack {
				PasswordViewNew(opacityOfPassword: opacityOfPassword, password: password)
				GeneratePasswordButtonStyleNew(blur: 0)
				GeneratePasswordButtonStyleNew(blur: 0.5)
				GeneratePasswordButtonNew(opacityOfPassword: opacityOfPassword, website: website, masterKey: masterKey, password: password, isGeneratorButtonPressed: isGeneratorButtonPressed)
				DummyButtonNew(isDarkMode: isDarkmodeTrue)
				DummyButtonNew(isDarkMode: isDarkmodeFalse)
				ResetButtonNew(opacityOfPassword: opacityOfPassword, website: website, masterKey: masterKey, password: password, isGenerateButtonPressed: isGeneratorButtonPressed)
			}
		}
    }
}

//
//  GeneratePasswordButtonView.swift
//  PasswordGenerator
//
//  Created by Sovi on 2023. 02. 01..
//

import SwiftUI

struct GeneratePasswordButtonView: View {
	@Binding var isDarkMode: Bool
	@Binding var opacityOfPassword: Double
	@Binding var isGenerateButtonPressed: Bool
	
	@Binding var website: String
	@Binding var masterkey: String
	@Binding var password: String
	
	
	var body: some View {
		VStack {

			if (isPasswordGeneratePossible(website: website, masterkey: masterkey) == true
			&& isGenerateButtonPressed == false)
			{
				GeneratePasswordButtonNew(opacityOfPassword: $opacityOfPassword,website: $website, masterKey: $masterkey, password: $password, isGeneratorButtonPressed: $isGenerateButtonPressed)
			}
			else if (opacityOfPassword == 100)
			{
				ResetButtonNew(opacityOfPassword: $opacityOfPassword, website: $website, masterKey: $masterkey, password: $password, isGenerateButtonPressed: $isGenerateButtonPressed)
			}
			
			else {
				DummyButtonNew(isDarkMode: $isDarkMode)
				
			}
		}
	}
}


struct GeneratePasswordButtonView_Previews: PreviewProvider {
	static private var isDarkMode = Binding.constant(false)
	static private var opacityOfPassword = Binding.constant(100.0)
	static private var website = Binding.constant("facebook")
	static private var masterKey = Binding.constant("qwerty00")
	static private var password = Binding.constant("sdkfhdskhs")
	static private var isGenerateButtonPressed = Binding.constant(false)
	
    static var previews: some View {
		GeneratePasswordButtonView(isDarkMode: isDarkMode ,opacityOfPassword: opacityOfPassword, isGenerateButtonPressed: isGenerateButtonPressed, website: website, masterkey: masterKey, password: password)
    }
}

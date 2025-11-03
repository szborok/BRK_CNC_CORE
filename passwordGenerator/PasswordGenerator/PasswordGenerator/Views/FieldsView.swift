//
//  ButttonStyles.swift
//  PasswordGenerator
//
//  Created by Sovi on 2023. 01. 06..
//

import SwiftUI


struct FieldStyle: View {
	
	var body: some View {
		RoundedRectangle(cornerRadius: Constants.General.fieldCornerRadius)
			.stroke(LinearGradient(
				colors: [.red, .blue],
				startPoint: .leading,
				endPoint: .trailing)
			)
			.frame(maxWidth: .infinity)
			.frame(height: Constants.General.fieldHeight)
			.padding(.horizontal, 10)
	}
}


struct TextFieldView: View {
	@Binding var website: String
	
	var body: some View {
		HStack() {
			Image(systemName: "globe")
				.foregroundColor(Color(Constants.Colors.BlackWhite))
				.frame(width: 33, height: 33)
				.padding(.leading, 20)
			
			ZStack(alignment: .leading) {
				if website.isEmpty {
					Text("Website")
						.foregroundColor(Color(Constants.Colors.BlackWhite))
						.opacity(0.4)
					
				}
				
				TextField("", text: $website)
					.foregroundColor(Color(Constants.Colors.BlackWhite))
					.autocorrectionDisabled(true)
					.autocapitalization(.none)
			}
		}
		.frame(maxWidth: .infinity)
		.frame(height: Constants.General.fieldHeight, alignment: .center)
	}
}


struct SecuredFieldView: View {
	@Binding var isMasterkeyHidden: Bool
	@Binding var masterkey: String
	
	var body: some View {
		HStack() {
			Image(systemName: "key.horizontal")
				.foregroundColor(Color(Constants.Colors.BlackWhite))
				.frame(width: 33, height: 33)
				.padding(.leading, 20)
			
			ZStack(alignment: .leading) {
				if masterkey.isEmpty {
					Text("Masterkey")
						.foregroundColor(Color(Constants.Colors.BlackWhite))
						.opacity(0.4)
					
				}
				
				Group {
					if isMasterkeyHidden == true {
						SecureField("", text: $masterkey)
							.foregroundColor( isPasswordValid(victim: masterkey) ? (Color(Constants.Colors.BlackWhite)) : (Color(Constants.Colors.Red)))
							.autocorrectionDisabled(true)
							.autocapitalization(.none)
					}
					else {
						TextField("", text: $masterkey)
							.foregroundColor( isPasswordValid(victim: masterkey) ? (Color(Constants.Colors.BlackWhite)) : (Color(Constants.Colors.Red)))
							.autocorrectionDisabled(true)
							.autocapitalization(.none)
					}
				}
			}
			
			Button(action: { isMasterkeyHidden.toggle() })
			{ Image(systemName: self.isMasterkeyHidden ? "eye.slash" : "eye")
				.accentColor(Color(Constants.Colors.BlackWhite)) }
			.padding(.trailing, 20)
		}
		.frame(maxWidth: .infinity)
		.frame(height: Constants.General.fieldHeight, alignment: .center)
	}
}









struct FieldsView_Previews: PreviewProvider {
	
	static var previews: some View {
		VStack {
			ZStack {
				FieldStyle()
				TextFieldView(website: .constant("facebook"))
				//.frame(width: 350, height: 33, alignment: .center)
			}
			
			ZStack {
				FieldStyle()
				SecuredFieldView(isMasterkeyHidden: .constant(false), masterkey: .constant("qwerty"))
				//.frame(width: 350, height: 33, alignment: .center)
			}
			ZStack {
				FieldStyle()
				TextFieldView(website: .constant(""))
				//.frame(width: 350, height: 33, alignment: .center)
			}
		}
	}
}

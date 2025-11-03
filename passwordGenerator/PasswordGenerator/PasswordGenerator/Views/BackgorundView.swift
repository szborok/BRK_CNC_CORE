//
//  BackgorundView.swift
//  PasswordGenerator
//
//  Created by Sovi on 2023. 01. 27..
//

import SwiftUI
import MapKit

struct BackgroundView: View {
	@Binding var isDarkMode: Bool
	@Binding var isInfotabShowing: Bool
	
	var body: some View {
		ZStack {
			LinearGradient(gradient: Gradient(colors: [Color(Constants.Colors.BackgroundColor)]),
						   startPoint: .topTrailing, endPoint: .bottomTrailing)
			.edgesIgnoringSafeArea(.all)
			
			VStack {
				Topview(isDarkMode: $isDarkMode, isInfotabShowing: $isInfotabShowing)
				
				Spacer()
			}
		}
	}
}


struct ImageBackgroundView: View {
	@Binding var isDarkMode: Bool
	@Binding var isInfotabShowing: Bool
	
	var body: some View {
		ZStack {
			Image("Budapest1")
				.resizable()
				.scaledToFill()
				.edgesIgnoringSafeArea(.all)
				.padding()
				.padding(.bottom, 300)
				.blur(radius: 2)
			
			VStack {
				Topview(isDarkMode: $isDarkMode, isInfotabShowing: $isInfotabShowing)
				
				Spacer()
			}
		}
	}
}


struct MapBackgroundView: View {
	@Binding var isDarkMode: Bool
	@Binding var isInfotabShowing: Bool
	
	var body: some View {
		ZStack {
			MapView(isDarkMode: $isDarkMode)
			
			VStack {
				Topview(isDarkMode: $isDarkMode, isInfotabShowing: $isInfotabShowing)
				
				Spacer()
			}
		}
	}
}



struct Topview: View {
	@Binding var isDarkMode: Bool
	@Binding var isInfotabShowing: Bool
	var iconSize = CGFloat(25)
	
	var body: some View {
		HStack {
			Button(action: { isDarkMode.toggle() }) {
				Image(systemName: self.isDarkMode ? "sun.min" : "moon.circle")
					.font(.system(size: iconSize))
					.frame(width: iconSize, height: iconSize)
					.padding()
			}
			
			Spacer()
			
			Button(action: { isInfotabShowing.toggle() }) {
				Image(systemName: "info.circle")
					.font(.system(size: iconSize))
					.frame(width: iconSize, height: iconSize)
					.padding()
			}
			.sheet(isPresented: $isInfotabShowing,
				   onDismiss: {},
				   content: { InfotabView() })
		}
	}
}




struct BackgorundView_Previews: PreviewProvider {
	static private var isInfotabShowing = Binding.constant(false)
	
    static var previews: some View {
		BackgroundView(isDarkMode: .constant(false), isInfotabShowing: isInfotabShowing)
		BackgroundView(isDarkMode: .constant(true), isInfotabShowing: isInfotabShowing)
			.preferredColorScheme(.dark)
		MapBackgroundView(isDarkMode: .constant(false), isInfotabShowing: isInfotabShowing)
		ImageBackgroundView(isDarkMode: .constant(false), isInfotabShowing: isInfotabShowing)
    }
}

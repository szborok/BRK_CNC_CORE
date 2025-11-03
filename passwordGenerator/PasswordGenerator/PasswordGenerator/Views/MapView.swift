//
//  MapView.swift
//  PasswordGenerator
//
//  Created by Sovi on 2023. 02. 07..
//

import SwiftUI
import MapKit

struct MapView: View {
	@Binding var isDarkMode: Bool
	
	let BPLocation = MKCoordinateRegion(center: CLLocationCoordinate2D(latitude: 47.498 - 0.053, longitude: 19.04 + 0.015), span: MKCoordinateSpan(latitudeDelta: 0.2, longitudeDelta: 0.2))
	
	var userLocation = MKCoordinateRegion(center: CLLocationCoordinate2D(latitude: 47.498 - 0.053, longitude: 19.04 + 0.015), span: MKCoordinateSpan(latitudeDelta: 0.2, longitudeDelta: 0.2))
	
    var body: some View {
		ZStack {
			Map(coordinateRegion: .constant(BPLocation))
				.centerCropped()
				.ignoresSafeArea(.all)
			
			Color(Constants.Colors.WhiteBlack)
				.opacity(0.7)
				.ignoresSafeArea()
		}
		.blur(radius: 2, opaque: false)
		.preferredColorScheme(isDarkMode ? .dark : .light)
	}
}


extension Map {
	func centerCropped() -> some View {
		GeometryReader { geo in
			self
			.scaledToFill()
			.frame(width: geo.size.width, height: geo.size.height)
			.clipped()
		}
	}
}
















struct MapView_Previews: PreviewProvider {
    static var previews: some View {
		MapView(isDarkMode: .constant(false))
		MapView(isDarkMode: .constant(true))
    }
}

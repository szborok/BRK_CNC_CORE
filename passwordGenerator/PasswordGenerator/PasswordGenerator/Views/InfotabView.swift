//
//  InfotabView.swift
//  PasswordGenerator
//
//  Created by Sovi on 2023. 02. 07..
//

import SwiftUI

struct InfotabView: View {
	//@Binding var isInfotabShowing: Bool
	
    var body: some View {
		Color(Constants.Colors.BackgroundColor)
			.opacity(0.5)
    }
}








struct InfotabView_Previews: PreviewProvider {
	static private var isInfotabShowing = Binding.constant(false)
	
    static var previews: some View {
        //InfotabView(isInfotabShowing: isInfotabShowing)
		InfotabView()
    }
}

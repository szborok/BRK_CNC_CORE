//
//  ContentView.swift
//  UI_TEST
//
//  Created by Sovi on 2024. 12. 29..
//

import SwiftUI

struct ContentView: View {
    var body: some View {
        VStack {
            Image(systemName: "globe")
                .imageScale(.large)
                .foregroundStyle(.tint)
            Text("Hello, world!")
            Button(/*@START_MENU_TOKEN@*/"Button"/*@END_MENU_TOKEN@*/) {
                /*@START_MENU_TOKEN@*//*@PLACEHOLDER=Action@*/ /*@END_MENU_TOKEN@*/
            }.buttonStyle()
        }
        .padding()
    }
}

#Preview {
    ContentView()
}

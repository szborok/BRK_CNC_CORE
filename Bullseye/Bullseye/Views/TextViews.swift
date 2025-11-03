//
//  TextViews.swift
//  Bullseye
//
//  Created by Sovi on 2023. 01. 25..
//

import SwiftUI

struct InstructionText: View {
	var text: String
	
    var body: some View {
		Text(text.uppercased())
			.bold()
			.kerning(2.0)
			.multilineTextAlignment(.center)
			.lineSpacing(4.0)
			.font(.footnote)
			.foregroundColor(Color(Constants.MyColors.TextColor))
    }
}


struct BigNumberView: View {
	var text: String
	
	var body: some View {
		Text(text)
			.kerning(-1.0)
			.fontWeight(.black)
			.font(.largeTitle)
			.foregroundColor(Color(Constants.MyColors.TextColor))
	}
}


struct SliderLabelText: View {
	var text: String
	
	var body: some View {
		Text(text)
			.fontWeight(.bold)
			.font(.body)
			.foregroundColor(Color(Constants.MyColors.TextColor))
			.frame(width: 35.0)
	}
}


struct LabelText: View {
	var text: String
	
	var body: some View {
		Text(text)
			.fontWeight(.bold)
			.font(.caption)
			.foregroundColor(Color(Constants.MyColors.TextColor))
			.kerning(1.5)
	}
}


struct BodyText: View {
	var text: String
	
	var body: some View {
		Text(text)
			.font(.subheadline)
			.fontWeight(.semibold)
			.multilineTextAlignment(.center)
			.lineSpacing(12.0)
	}
}


struct ButtonText: View {
	var text: String
	
	var body: some View {
		Text(text)
			.bold()
			.padding()
			.frame(maxWidth: .infinity)
			.background(Color.accentColor)
			.foregroundColor(Color.white)
			.cornerRadius(12.0)
	}
}


struct ScoreText: View {
	var score: Int
	
	var body: some View {
		Text(String(score))
			.bold()
			.kerning(-0.2)
			.foregroundColor(Color(Constants.MyColors.TextColor))
			.font(.title3)
	}
}


struct DateText: View {
	var date: Date
	
	var body: some View {
		Text(date, style: .time)
			.bold()
			.kerning(-0.2)
			.foregroundColor(Color(Constants.MyColors.TextColor))
			.font(.title3)
			
	}
}


struct BigBoldText: View {
	let text: String
	
	var body: some View {
		Text(text.uppercased())
			.kerning(2.0)
			.foregroundColor(Color(Constants.MyColors.TextColor))
			.font(.title)
			.fontWeight(.black)
	}
}











struct TextViews_Previews: PreviewProvider {
    static var previews: some View {
		VStack{
			InstructionText(text: "🎯🎯🎯\nPUT THE BULLSEYE AS CLOSE AS YOU CAN TO")
			BigNumberView(text: "999")
			SliderLabelText(text: "99")
			LabelText(text: "9")
			BodyText(text: "You scored 200 points\n🎉🎉🎉")
			ButtonText(text: "Start New Round")
			ScoreText(score: 459)
			DateText(date: Date())
			BigBoldText(text: "leaderboard")
		}
		.padding()
    }
}

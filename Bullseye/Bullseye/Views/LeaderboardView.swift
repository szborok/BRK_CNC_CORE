//
//  LeaderboardView.swift
//  Bullseye
//
//  Created by Sovi on 2023. 02. 04..
//

import SwiftUI

struct LeaderboardView: View {
	@Binding var leaderBoardIsShowing: Bool
	@Binding var game: Game
	
    var body: some View {
		ZStack {
			Color(Constants.MyColors.BackgroundColor)
				.edgesIgnoringSafeArea(.all)
			VStack(spacing: 10) {
				HeaderView(leaderBoardIsShowing: $leaderBoardIsShowing)
				LabelView()
				ScrollView {
					VStack(spacing: 10) {
						ForEach(game.leaderboardEntries.indices, id: \.self) { i in
							let leaderboardEntry = game.leaderboardEntries[i]
							RowView(index: i, score: leaderboardEntry.score, date: leaderboardEntry.date) }
					}
				}
			}
		}
    }
}


struct RowView: View {
	let index: Int
	let score: Int
	let date: Date
	
	var body: some View {
		HStack {
			RoundedTextView(text: String(index))
			Spacer()
			ScoreText(score: score)
				.frame(width: Constants.Leaderboard.leaderboardScoreColWidth)
			Spacer()
			DateText(date: date)
				.frame(width: Constants.Leaderboard.leaderboardDateColWidht)
		}
		.background(
			RoundedRectangle(cornerRadius: .infinity)
				.strokeBorder(Color(Constants.MyColors.LeaderboardRowColor),
							  lineWidth: Constants.General.strokeWidth)
		)
		.padding(.leading)	//could be .padding(.horizontal)
		.padding(.trailing)
		.frame(maxWidth: Constants.Leaderboard.leaderboardMaxRowWidht)
	}
}


struct HeaderView: View {
	@Binding var leaderBoardIsShowing: Bool
	@Environment(\.verticalSizeClass) var verticalSizeClass
	@Environment(\.horizontalSizeClass) var horizontalSizeClass
	
	
	var body: some View {
		ZStack {
			HStack {
				if verticalSizeClass == .regular &&
					horizontalSizeClass == .regular
				{
					BigBoldText(text: "leaderboard")
				} else {
					BigBoldText(text: "leaderboard")
						.padding(.leading)
					Spacer()
				}
			}
			HStack {
				Spacer()
				Button(action: { leaderBoardIsShowing = false }) {
					RoundedImageViewFilled(systemName: "xmark")
						.padding(.trailing)
				}
			}
		}
		.padding(.top)
	}
}


struct LabelView: View {
	var body: some View {
		HStack {
			Spacer()
				.frame(width: Constants.General.roundedViewLenght)
			
			Spacer()
			
			LabelText(text: "Score")
				.frame(width: Constants.Leaderboard.leaderboardScoreColWidth)
			
			Spacer()
			
			LabelText(text: "Date")
				.frame(width: Constants.Leaderboard.leaderboardDateColWidht)
		}
		.padding(.leading)	//could be .padding(.horizontal)
		.padding(.trailing)
		.frame(maxWidth: Constants.Leaderboard.leaderboardMaxRowWidht)
	}
}






struct LeaderboardView_Previews: PreviewProvider {
	static private var leaderBoardIsShowing = Binding.constant(false)
	static private var game = Binding.constant(Game(loadTestData: true))
	
    static var previews: some View {
        LeaderboardView(leaderBoardIsShowing: leaderBoardIsShowing, game: game)
		LeaderboardView(leaderBoardIsShowing: leaderBoardIsShowing, game: game)
			.previewInterfaceOrientation(.landscapeRight)
		LeaderboardView(leaderBoardIsShowing: leaderBoardIsShowing, game: game)
			.preferredColorScheme(.dark)
    }
}

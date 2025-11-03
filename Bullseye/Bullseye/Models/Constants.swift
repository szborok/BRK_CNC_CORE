//
//  Models.swift
//  Bullseye
//
//  Created by Sovi on 2023. 02. 02..
//

import Foundation
import UIKit
import SwiftUI

enum Constants {
	enum General {
		public static let strokeWidth = CGFloat(2.0)
		public static let roundedViewLenght = CGFloat(56.0)
		public static let roundRectViewWidth = CGFloat(68.0)
		public static let roundRectViewHeight = CGFloat(56.0)
		public static let roundRectCornerRadius = CGFloat(21.0)
	}
	
	enum MyColors {
		public static let BackgroundColor = "BackgroundColor"
		public static let ButtonColor = "ButtonColor"
		public static let ButtonFilledBackgroundColor = "ButtonFilledBackgroundColor"
		public static let ButtonFilledTextColor = "ButtonFilledTextColor"
		public static let ButtonStrokeColor = "ButtonStrokeColor"
		public static let LeaderboardRowColor = "LeaderboardRowColor"
		public static let RingsColor = "RingsColor"
		public static let TextColor = "TextColor"
	}
	
	enum Leaderboard {
		public static let leaderboardScoreColWidth = CGFloat(50.0)
		public static let leaderboardDateColWidht = CGFloat(125.0)
		public static let leaderboardMaxRowWidht = CGFloat(480.0)
	}
}

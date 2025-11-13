1 BEGIN PGM W5246NS01007AA1 MM
2 ; ----------------------------------
3 ; PROJECT	  :
4 ; DRAWING NUMBER:
5 ; INDEX   	  :
6 ; MACHINE	  : DMG DMC 105V linear
7 ; DATE   	  : 12.11.2025
8 ; TIME  	  : 10:29
9 ; PROGRAM RAN	  :
10 ; ----------------------------------
11 ;
12 ; created by hyperMILL 2025 OPEN MIND Technologies AG
13 ;
14 ; --- TOOLLIST BEGIN ----------------------------------
15 ; T477918365 | GUH-6713-D12_H63ZM12L90 / DM=12 CR=0 TL=130
16 ; ---- TOOLLIST END -----------------------------------
17 ;
18 ; --- BLOCK FORM -------------------
19 BLK FORM 0.1 Z X-95 Y-258 Z-22.25
20 BLK FORM 0.2 X95 Y258 Z0.25
21 ; ----------------------------------
22 ;
23 ; ----------------------------------
24 L Z+0 R0 FMAX M92
25 ; ----------------------------------
26 * - T477918365 | GUH-6713-D12_H63ZM12L90 / DM=12 CR=0 TL=130
27 TOOL CALL "LE12000000400183" Z S10436 DL+0 DR+0
28 ; ----------------------------------
29 L Z+0 R0 FMAX M92
30 ; ----------------------------------
31 ; OPERATION 1
32 *   - JOB: 1: LT_FreePar12_GUH-6713-D12
33 ; ----------------------------------
34 FN 0:Q1=1044 ; XY FEED RATE
35 FN 0:Q2=417 ; Z FEED RATE
36 CYCL DEF 32.0 TOLERANCE
37 CYCL DEF 32.1 T0.03
38 L X97.71 Y193 R0 F MAX M3 
39 L Z75 R0 F MAX 
40 M25
41 L Z2.05 R0 F MAX 
42 L Z0.37 FQ2
43 L X97.05 Z-2.95 FQ1
44 L Y190 
45 L Y-190 
46 L Y-193 
47 L X97.71 Z0.37 
48 L Z75 R0 F MAX 
49 L X96.71 Y193 R0 F MAX 
50 L Z6.37 R0 F MAX 
51 L Z1.37 FQ2
52 L X96.05 Z-2.95 FQ1
53 L Y190 
54 L Y-190 
55 L Y-193 
56 L X96.71 Z1.37 
57 L Z75 R0 F MAX 
58 L X-97.71 R0 F MAX 
59 L Z5.37 R0 F MAX 
60 L Z0.37 FQ2
61 L X-97.05 Z-2.95 FQ1
62 L Y-190 
63 L Y190 
64 L Y193 
65 L X-97.71 Z0.37 
66 L Z75 R0 F MAX 
67 L X-96.71 Y-193 R0 F MAX 
68 L Z6.37 R0 F MAX 
69 L Z1.37 FQ2
70 L X-96.05 Z-2.95 FQ1
71 L Y-190 
72 L Y190 
73 L Y193 
74 L X-96.71 Z1.37 
75 L Z75 R0 F MAX 
76 M9
77 M5
78 ; ----------------------------------
79 L Z+0 R0 FMAX M92
80 L X+0 Y+0 R0 FMAX M92
81 ; ----------------------------------
82 M30
83 END PGM W5246NS01007AA1 MM

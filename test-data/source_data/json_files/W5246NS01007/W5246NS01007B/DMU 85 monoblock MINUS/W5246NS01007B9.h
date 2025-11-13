1 BEGIN PGM W5246NS01007B9 MM
2 ; ----------------------------------
3 ; PROJECT	  :
4 ; DRAWING NUMBER:
5 ; INDEX   	  :
6 ; MACHINE	  : DMG DMU 85 monoBLOCK
7 ; DATE   	  : 12.11.2025
8 ; TIME  	  : 10:30
9 ; PROGRAM RAN	  :
10 ; ----------------------------------
11 ;
12 ;created by hyperMILL 2025 OPEN MIND Technologies AG
13 ;
14 ; --- TOOLLIST BEGIN ---------------
15 ; T1449295818 | GUH-4630-MF_M10_H63PL100-MF / DM=10 CR=0 TL=166
16 ; ---- TOOLLIST END ----------------
17 ;
18 ; --- BLOCK FORM -------------------
19 BLK FORM 0.1 Z X-258 Y-95 Z-22
20 BLK FORM 0.2 X258 Y95 Z0
21 ; ----------------------------------
22 ;
23 ; ----------------------------------
24 CYCL DEF 392 ATC~
   Q240=0 ;TUNING MODE~
   Q241=1 ;WEIGHT MODE
25 ; ----------------------------------
26 M127 ; SHORTER PATH TRAVERSE OF ROTARY AXES OFF
27 FUNCTION RESET TCPM
28 CALL LBL 1 ; RESET WORKING PLANE
29 ; --- SAFEPOSITION TOOL CALL -------
30 L Z0 R0 FMAX M91
31 L X0 R0 FMAX M91
32 L Y-425 R0 FMAX M91
33 ; ----------------------------------
34 L A0 R0 FMAX
35 ; ----------------------------------
36 * - TOOL: T1449295818 | GUH-4630-MF_M10_H63PL100-MF / DM=10 CR=0 TL=166
37 TOOL CALL "MH10000000600275" Z S191 DL+0 DR+0
38 ; ----------------------------------
39 *   - JOB: 18: M10-menetfúrás-CYCL207
40 ; ----------------------------------
41 CALL LBL 1 ; RESET WORKING PLANE
42 FN 0:Q3=286 ; Z FEED RATE
43 ; --- SAFEPOSITION -----------------
44 L Z0 R0 FMAX M91
45 L X0 R0 FMAX M91
46 L Y-425 R0 FMAX M91
47 ; ----------------------------------
48 ; ----------------------------------
49 ; A0 C0
50 ; ----------------------------------
51 CYCL DEF 7.0 DATUM SHIFT
52 CYCL DEF 7.1 X0
53 CYCL DEF 7.2 Y0
54 CYCL DEF 7.3 Z0
55 PLANE SPATIAL SPA0 SPB0 SPC0 STAY SEQ+ TABLE ROT
56 L A+Q120 C+Q122 R0 FMAX M126
57 L X165 Y-60 R0 F MAX M3
58 M8
59 L Z50 R0 F MAX
60 CYCL DEF 207 RIGID TAPPING NEW~
   Q200=3 ;SET-UP CLEARANCE~
   Q201=-18.3 ;DEPTH~
   Q239=+1.5 ;THREAD PITCH~
   Q203=0 ;SURFACE COORDINATE~
   Q204=50 ;2ND SET-UP CLEARANCE
61 L X165 Y-60 R0 F MAX M99
62 L X165 Y60 R0 F MAX M99
63 L X0 Y40 R0 F MAX M99
64 L X0 Y-40 R0 F MAX M99
65 L X-165 Y-60 R0 F MAX M99
66 L X-165 Y60 R0 F MAX M99
67 M9
68 M5
69 CALL LBL 1 ; RESET WORKING PLANE
70 ; --- SAFEPOSITION END -------------
71 L Z0 R0 FMAX M91
72 L X0 R0 FMAX M91
73 L Y-425 R0 FMAX M91
74 ; ----------------------------------
75 ; --- SAFEPOSITION END -------------
76 L Z0 R0 FMAX M91
77 L X0 R0 FMAX M91
78 L Y0 R0 FMAX M91
79 ; ----------------------------------
/80 M30
81 * --- LBL BEGIN --------------------
82 LBL 1 ; RESET WORKING PLANE
83 CYCL DEF 7.0 DATUM SHIFT
84 CYCL DEF 7.1 X0
85 CYCL DEF 7.2 Y0
86 CYCL DEF 7.3 Z0
87 PLANE RESET STAY
88 LBL 0
89 ; ----------------------------------
90 LBL "CuttingEdgesCheck"
91 FN 9: IF +Q1900 EQU +1 GOTO LBL "CuttingEdges1"
92 FN 9: IF +Q1900 EQU +2 GOTO LBL "CuttingEdges2"
93 LBL 0
94 ; ----------------------------------
95 LBL "CuttingEdges1"
96 FN 0: Q1901=4
97 LBL 0
98 ; ----------------------------------
99 LBL "CuttingEdges2"
100 FN 0: Q1901=3
101 LBL 0
102 ; ----------------------------------
103 END PGM W5246NS01007B9 MM

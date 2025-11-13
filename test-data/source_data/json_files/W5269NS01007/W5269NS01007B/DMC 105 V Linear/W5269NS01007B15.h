1 BEGIN PGM W5269NS01007B15 MM
2 ; ----------------------------------
3 ; PROJECT	  :
4 ; DRAWING NUMBER:
5 ; INDEX   	  :
6 ; MACHINE	  : DMG DMC 105V linear
7 ; DATE   	  : 13.11.2025
8 ; TIME  	  : 08:37
9 ; PROGRAM RAN	  :
10 ; ----------------------------------
11 ;
12 ; created by hyperMILL 2025 OPEN MIND Technologies AG
13 ;
14 ; --- TOOLLIST BEGIN ----------------------------------
15 ; T397605229 | GUH-4630-MF_M6_H63PL100-MF / DM=6 CR=0 TL=156
16 ; ---- TOOLLIST END -----------------------------------
17 ;
18 ; --- BLOCK FORM -------------------
19 BLK FORM 0.1 Z X-498 Y-184 Z-46
20 BLK FORM 0.2 X498 Y184 Z0
21 ; ----------------------------------
22 ;
23 ; ----------------------------------
24 L Z+0 R0 FMAX M92
25 ; ----------------------------------
26 * - T397605229 | GUH-4630-MF_M6_H63PL100-MF / DM=6 CR=0 TL=156
27 TOOL CALL "MH06000000500275" Z S318 DL+0 DR+0
28 ; ----------------------------------
29 L Z+0 R0 FMAX M92
30 ; ----------------------------------
31 ; OPERATION 35
32 *   - JOB: 35: 35/058 M6-menetf/250r/225s-CYCL207
33 ; ----------------------------------
34 FN 0:Q2=318 ; Z FEED RATE
35 L X298 Y130 R0 F MAX M3 
36 L Z50 R0 F MAX 
37 ; --- coolant.txt ----
38 M8
39 CYCL DEF9 .0 VARAKOZASI IDO
40 CYCL DEF9.1 V.IDO5
41 ; -------
42 CYCL DEF 207 RIGID TAPPING NEW~
    Q200=3 ;SET-UP CLEARANCE~
    Q201=-11.5 ;DEPTH~
    Q239=+1 ;THREAD PITCH~
    Q203=0 ;SURFACE COORDINATE~
    Q204=50 ;2ND SET-UP CLEARANCE
43 L X298 Y130 R0 F MAX M99
44 L X298 Y-130 R0 F MAX M99
45 L X-298 Y-130 R0 F MAX M99
46 L X-298 Y130 R0 F MAX M99
47 M9
48 M5
49 ; ----------------------------------
50 L Z+0 R0 FMAX M92
51 L X+0 Y+0 R0 FMAX M92
52 ; ----------------------------------
53 M30
54 END PGM W5269NS01007B15 MM

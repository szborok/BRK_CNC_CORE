1 BEGIN PGM W5269NS01007B14 MM
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
15 ; T508461572 | GUH-4630-MF_M12_H63PL100-MF / DM=12 CR=0 TL=180.5
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
26 * - T508461572 | GUH-4630-MF_M12_H63PL100-MF / DM=12 CR=0 TL=180.5
27 TOOL CALL "MH12000000730275" Z S159 DL+0 DR+0
28 ; ----------------------------------
29 L Z+0 R0 FMAX M92
30 ; ----------------------------------
31 ; OPERATION 34
32 *   - JOB: 34: 34/058  M12 - Menetfuras
33 ; ----------------------------------
34 FN 0:Q2=278 ; Z FEED RATE
35 L X50 Y125 R0 F MAX M3 
36 L Z50 R0 F MAX 
37 ; --- coolant.txt ----
38 M8
39 CYCL DEF9 .0 VARAKOZASI IDO
40 CYCL DEF9.1 V.IDO5
41 ; -------
42 CYCL DEF 207 RIGID TAPPING NEW~
    Q200=5 ;SET-UP CLEARANCE~
    Q201=-25 ;DEPTH~
    Q239=+1.75 ;THREAD PITCH~
    Q203=-7 ;SURFACE COORDINATE~
    Q204=57 ;2ND SET-UP CLEARANCE
43 L X50 Y125 R0 F MAX M99
44 L X-350 Y125 R0 F MAX M99
45 L X-350 Y-125 R0 F MAX M99
46 L X-50 Y-125 R0 F MAX M99
47 L X350 Y-125 R0 F MAX M99
48 L X350 Y125 R0 F MAX M99
49 M9
50 M5
51 ; ----------------------------------
52 L Z+0 R0 FMAX M92
53 L X+0 Y+0 R0 FMAX M92
54 ; ----------------------------------
55 M30
56 END PGM W5269NS01007B14 MM

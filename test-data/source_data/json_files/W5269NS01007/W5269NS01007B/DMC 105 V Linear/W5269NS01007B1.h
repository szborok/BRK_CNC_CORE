1 BEGIN PGM W5269NS01007B1 MM
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
15 ; T954766263 | WID-TCF-TF27_H63W32L90 / DM=27 CR=0 TL=260
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
26 * - T954766263 | WID-TCF-TF27_H63W32L90 / DM=27 CR=0 TL=260
27 TOOL CALL "TF27000001700351" Z S943 DL+0 DR+0
28 ; ----------------------------------
29 L Z+0 R0 FMAX M92
30 ; ----------------------------------
31 ; OPERATION 1
32 *   - JOB: 1: 1/058 /060FreePar12/062_WID-TCF-TF27_Top/0580/1240_Bot/0580/1240
33 ; ----------------------------------
34 FN 0:Q2=75 ; Z FEED RATE
35 L X0 Y160 R0 F MAX M3 
36 L Z50 R0 F MAX 
37 ; --- coolant.txt ----
38 M8
39 CYCL DEF9 .0 VARAKOZASI IDO
40 CYCL DEF9.1 V.IDO5
41 ; -------
42 CYCL DEF 200 DRILLING~
    Q200=5 ;SET-UP CLEARANCE~
    Q201=-15 ;DEPTH~
    Q206=Q2 ;FEED RATE FOR PLUNGING~
    Q202=15 ;PLUNGING DEPTH~
    Q210=0 ;DWELL TIME AT TOP~
    Q203=0 ;SURFACE COORDINATE~
    Q204=50 ;2ND SET-UP CLEARANCE~
    Q211=0 ;DWELL TIME AT BOTTOM
43 L X0 Y160 R0 F MAX M99
44 L X0 Y-160 R0 F MAX M99
45 M9
46 M5
47 ; ----------------------------------
48 L Z+0 R0 FMAX M92
49 L X+0 Y+0 R0 FMAX M92
50 ; ----------------------------------
51 M30
52 END PGM W5269NS01007B1 MM

1 BEGIN PGM W5246NS01007A2 MM
2 ; ----------------------------------
3 ; PROJECT	  :
4 ; DRAWING NUMBER:
5 ; INDEX   	  :
6 ; MACHINE	  : DMG DMC 105V linear
7 ; DATE   	  : 12.11.2025
8 ; TIME  	  : 10:28
9 ; PROGRAM RAN	  :
10 ; ----------------------------------
11 ;
12 ; created by hyperMILL 2025 OPEN MIND Technologies AG
13 ;
14 ; --- TOOLLIST BEGIN ----------------------------------
15 ; T1842138278 | KOM-U11-TF34_H63ABS50 / DM=34 CR=0 TL=202
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
26 * - T1842138278 | KOM-U11-TF34_H63ABS50 / DM=34 CR=0 TL=202
27 TOOL CALL "TF34000001420102" Z S1051 DL+0 DR+0
28 ; ----------------------------------
29 L Z+0 R0 FMAX M92
30 ; ----------------------------------
31 ; OPERATION 2
32 *   - JOB: 2: 2/058 /060FreePar12/062_KOM-U11-TF34_Top/0580/1240_Bot/0580/1240_T/218L/0583
33 ; ----------------------------------
34 FN 0:Q2=104 ; Z FEED RATE
35 L X60 Y-212.5 R0 F MAX M3 
36 L Z100 R0 F MAX 
37 ; --- coolant.txt ----
38 M8
39 CYCL DEF9 .0 VARAKOZASI IDO
40 CYCL DEF9.1 V.IDO5
41 ; -------
42 CYCL DEF 200 DRILLING~
    Q200=5 ;SET-UP CLEARANCE~
    Q201=-25.742 ;DEPTH~
    Q206=Q2 ;FEED RATE FOR PLUNGING~
    Q202=25.742 ;PLUNGING DEPTH~
    Q210=0 ;DWELL TIME AT TOP~
    Q203=0 ;SURFACE COORDINATE~
    Q204=100 ;2ND SET-UP CLEARANCE~
    Q211=0 ;DWELL TIME AT BOTTOM
43 L X60 Y-212.5 R0 F MAX M99
44 L X-60 Y-212.5 R0 F MAX M99
45 L X-60 Y212.5 R0 F MAX M99
46 L X60 Y212.5 R0 F MAX M99
47 M9
48 M5
49 ; ----------------------------------
50 L Z+0 R0 FMAX M92
51 L X+0 Y+0 R0 FMAX M92
52 ; ----------------------------------
53 M30
54 END PGM W5246NS01007A2 MM

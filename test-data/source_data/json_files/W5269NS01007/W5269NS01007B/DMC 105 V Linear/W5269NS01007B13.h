1 BEGIN PGM W5269NS01007B13 MM
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
15 ; T1658412194 | GUH-5678-KPF16_H63W16L80X / DM=16 CR=0 TL=143
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
26 * - T1658412194 | GUH-5678-KPF16_H63W16L80X / DM=16 CR=0 TL=143
27 TOOL CALL "KW16000000630354" Z S1001 DL+0 DR+0
28 ; ----------------------------------
29 L Z+0 R0 FMAX M92
30 ; ----------------------------------
31 ; OPERATION 33
32 *   - JOB: 33: 33/058 M12 - let/246r/233s
33 ; ----------------------------------
34 FN 0:Q2=50 ; Z FEED RATE
35 L X50 Y125 R0 F MAX M3 
36 L Z56 R0 F MAX 
37 ; --- coolant.txt ----
38 M8
39 CYCL DEF9 .0 VARAKOZASI IDO
40 CYCL DEF9.1 V.IDO5
41 ; -------
42 CYCL DEF 200 DRILLING~
    Q200=5 ;SET-UP CLEARANCE~
    Q201=-1.1 ;DEPTH~
    Q206=Q2 ;FEED RATE FOR PLUNGING~
    Q202=1.1 ;PLUNGING DEPTH~
    Q210=0 ;DWELL TIME AT TOP~
    Q203=-12.15 ;SURFACE COORDINATE~
    Q204=68.15 ;2ND SET-UP CLEARANCE~
    Q211=0 ;DWELL TIME AT BOTTOM
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
56 END PGM W5269NS01007B13 MM

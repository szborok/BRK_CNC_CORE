1 BEGIN PGM W5246NS01007A12 MM
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
15 ; T798365734 | FRA-P15251-S9.4R0_H63ZM10L85 / DM=9.4 CR=0 TL=128
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
26 * - T798365734 | FRA-P15251-S9.4R0_H63ZM10L85 / DM=9.4 CR=0 TL=128
27 TOOL CALL "SS09400000430179" Z S4402 DL+0 DR+0
28 ; ----------------------------------
29 L Z+0 R0 FMAX M92
30 ; ----------------------------------
31 ; OPERATION 23
32 *   - JOB: 23: Furat_sim_FRA-P15251-S9.4R0_DL:0_DR:0
33 ; ----------------------------------
34 FN 0:Q1=1202 ; XY FEED RATE
35 FN 0:Q2=1202 ; Z FEED RATE
36 CYCL DEF 32.0 TOLERANCE
37 CYCL DEF 32.1 T0.015
38 L X60 Y-212.5 R0 F MAX M3 
39 L Z75 R0 F MAX 
40 M25
41 CYCL DEF 208 BORE MILLING~
    Q200=0.5 ;SET-UP CLEARANCE~
    Q201=-0.5 ;DEPTH~
    Q206=Q2 ;FEED RATE FOR PLUNGING~
    Q334=0.25 ;PLUNGING DEPTH~
    Q203=-23.5 ;SURFACE COORDINATE~
    Q204=98.5 ;2ND SET-UP CLEARANCE~
    Q335=38 ;NOMINAL DIAMETER~
    Q342=37.9 ;ROUGHING DIAMETER
42 L X60 Y-212.5 R0 F MAX M99
43 L X-60 Y-212.5 R0 F MAX M99
44 L X-60 Y212.5 R0 F MAX M99
45 L X60 Y212.5 R0 F MAX M99
46 M9
47 M5
48 ; ----------------------------------
49 L Z+0 R0 FMAX M92
50 L X+0 Y+0 R0 FMAX M92
51 ; ----------------------------------
52 M30
53 END PGM W5246NS01007A12 MM

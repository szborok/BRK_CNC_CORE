1 BEGIN PGM W5269NS01007B3 MM
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
15 ; T937093217 | D14_HSS_CSF_H63T-D3-D16 / DM=14 CR=0 TL=234.2
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
26 * - T937093217 | D14_HSS_CSF_H63T-D3-D16 / DM=14 CR=0 TL=234.2
27 TOOL CALL "HS14000001250246" Z S455 DL+0 DR+0
28 ; ----------------------------------
29 L Z+0 R0 FMAX M92
30 ; ----------------------------------
31 ; OPERATION 6
32 *   - JOB: 6: 6 /058 D14_HSSCSF_CYCL203
33 ; ----------------------------------
34 FN 0:Q2=68 ; Z FEED RATE
35 L X0 Y0 R0 F MAX M3 
36 L Z50 R0 F MAX 
37 ; --- coolant.txt ----
38 M8
39 CYCL DEF9 .0 VARAKOZASI IDO
40 CYCL DEF9.1 V.IDO5
41 ; -------
42 CYCL DEF 203 UNIVERSAL DRILLING~
    Q200=3 ;SET-UP CLEARANCE~
    Q201=-9.041 ;DEPTH~
    Q206=Q2 ;FEED RATE FOR PLUNGING~
    Q202=1 ;PLUNGING DEPTH~
    Q210=0 ;DWELL TIME AT TOP~
    Q203=0 ;SURFACE COORDINATE~
    Q204=50 ;2ND SET-UP CLEARANCE~
    Q212=0 ;DECREMENT~
    Q213=2 ;BREAKS~
    Q205=1 ;MIN. PLUNGING DEPTH~
    Q211=0 ;DWELL TIME AT BOTTOM~
    Q208=25000 ;RETRACTION FEED TIME~
    Q256=0.2 ;DIST FOR CHIP BRKNG
43 L X0 Y0 R0 F MAX M99
44 L X298 Y-164 R0 F MAX M99
45 L X298 Y164 R0 F MAX M99
46 L X-298 Y164 R0 F MAX M99
47 L X-298 Y-164 R0 F MAX M99
48 M9
49 M5
50 ; ----------------------------------
51 L Z+0 R0 FMAX M92
52 L X+0 Y+0 R0 FMAX M92
53 ; ----------------------------------
54 M30
55 END PGM W5269NS01007B3 MM

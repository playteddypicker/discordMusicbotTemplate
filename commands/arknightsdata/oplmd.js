const lmddata6 = [ [], [], [] ];
const lmddata5 = [ [], [], [] ];
const lmddata4 = [ [], [], [] ];
const lmddata3 = [ [], [] ];

//6성 0정 1렙부터 50렙까지 필요 용문폐
lmddata6[0] = [
  0, 30, 66, 109, 159, 216, 281, 354, 435, 525,
  624, 732, 850, 978, 1116, 1265, 1425, 1607, 1813, 2044,
  2302, 2588, 2903, 3249, 3627, 4038, 4484, 4966, 5486, 6043,
  6638, 7273, 7950, 8670, 9434, 10243, 11099, 12003, 12955, 13947,
  14989, 16075, 17206, 18384, 19613, 20907, 22260, 23673, 25147, 26719,
];

//6성 1정 1렙부터 80렙까지 필요 용문폐
lmddata6[1] = [
  56719, 56767, 56838, 56933, 57053, 57199, 57372, 57573, 57804, 58066,
  58359, 58685, 59046, 59442, 59874, 60344, 60852, 61400, 61989, 62620,
  63295, 64014, 64779, 65590, 66449, 67357, 68315, 59325, 70387, 71503,
  72674, 73919, 75241, 76641, 78121, 79683, 81328, 83059, 84876, 86782,
  88778, 90949, 93298, 95829, 98546, 101453, 104553, 107851, 111350, 115055,
  118969, 123096, 127440, 132005, 136812, 142106, 148155, 154568, 161249, 168347,
  176100, 184216, 192594, 201346, 210478, 219996, 229905, 240211, 250920, 261947,
  273480, 285704, 298630, 312269, 326632, 341729, 357572, 374171, 391538, 409841,
];

//6성 2정 1렙부터 80렙까지 필요 용문폐
lmddata6[2] = [
  589841, 589917, 590041, 590214, 590439, 590718, 591052, 591444, 591895, 592408, 
  592985, 593627, 594337, 595117, 595968, 596893, 597894, 598973, 600132, 601372,
  602696, 604106, 605604, 607192, 608872, 610645, 612514, 614481, 616548, 618717,
  620990, 623403, 625959, 628661, 631512, 634515, 637673, 640989, 644466, 648106,
  651913, 655889, 660038, 664362, 668864, 673548, 678416, 683471, 688716, 694154,
  699788, 705655, 711758, 718101, 724688, 731523, 738609, 745949, 753548, 761409,
  769536, 778149, 787257, 796867, 806987, 817624, 828787, 840483, 852721, 865603,
  878946, 893105, 908093, 923921, 940602, 958147, 976569, 995880, 1016093, 1037219,
  1059311, 1083033, 1108413, 1135478, 1164256, 1194775, 1227062, 1261145, 1297051, 1334796,
];

lmddata5[0] = [
  0, 30, 66, 109, 159, 216, 281, 354, 435, 525,
  624, 732, 850, 978, 1116, 1265, 1425, 1607, 1813, 2044,
  2302, 2588, 2903, 3249, 3627, 4038, 4484, 4966, 5486, 6043,
  6638, 7273, 7950, 8670, 9434, 10243, 11099, 12003, 12955, 13947,
  14989, 16075, 17206, 18384, 19613, 20907, 22260, 23673, 25147, 26719,
]

for(let i = 0; i < 70; i++){
  lmddata5[1][i] = lmddata6[1][i] - 10000;
}

for(let i = 0; i < 80; i++){
  lmddata5[2][i] = lmddata6[2][i] - 217894;
}

lmddata4[0] = [
  0, 30, 66, 109, 159, 216, 281, 354, 435, 525,
  624, 732, 850, 978, 1116, 1265, 1425, 1607, 1813, 2044,
  2302, 2588, 2903, 3249, 3627, 4038, 4484, 4966, 5486, 6043,
  6638, 7273, 7950, 8670, 9434, 10243, 11099, 12003, 12955, 13947,
  14989, 16075, 17206, 18384, 19613,
];

for(let i = 0; i < 60; i++){
  lmddata4[1][i] = lmddata6[1][i] - 22106;
}

for(let i = 0; i < 70; i++){
  lmddata4[2][i] = lmddata6[2][i] - 383600;
}

lmddata3[0] = [
  0, 30, 66, 109, 159, 216, 281, 354, 435, 525,
  624, 732, 850, 978, 1116, 1265, 1425, 1607, 1813, 2044,
  2302, 2588, 2903, 3249, 3627, 4038, 4484, 4966, 5486, 6043,
  6638, 7273, 7950, 8670, 9434, 10243, 11099, 12003, 12955, 13947,
];

for(let i = 0; i < 55; i++){
  lmddata3[1][i] = lmddata6[1][i] - 32772;
}

module.exports = {
  lmddata6,
  lmddata5,
  lmddata4,
  lmddata3
};

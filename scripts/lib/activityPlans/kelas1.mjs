import {
  arrow,
  colors,
  dashedLine,
  equalsSign,
  fillCircle,
  fillRect,
  minusSign,
  plusSign,
  ring,
  strokeLine,
  strokeRect,
  triangle
} from "../illustrationKit.mjs";
import {
  apple,
  balanceScale,
  chevron,
  clockFace,
  coin,
  comparePanels,
  dashedBox,
  dayNight,
  dotColumn,
  dotRow,
  drawShape,
  equalSideMarks,
  hand,
  handSpan,
  miniClock,
  miniCrossedDots,
  miniDots,
  miniFrame,
  miniNumberLine,
  miniRuler,
  miniScale,
  miniTiles,
  patternStrip,
  rightAngleMarks,
  summaryTrio,
  tenFrame,
  towerRow
} from "../activityScenes.mjs";

export const PLAN = [
  {
    packageDir: "kelas1-matematika-b01-bilangan-1-10",
    base: "aktivitas-bilangan-1-10",
    summaryAlt: "Lima ilustrasi bilangan 1–10: kerangka sepuluh berisi tujuh titik merah, baris tujuh apel, perbandingan lima dan tiga titik, tiga kartu rangkuman, dan kerangka sepuluh dengan kelompok lima serta tiga titik.",
    steps: [
      {
        alt: "Kerangka sepuluh berisi tujuh titik merah dan tiga kotak kosong.",
        draw(c) {
          tenFrame(c, 235, 237, 7, colors.red);
        }
      },
      {
        alt: "Baris tujuh apel merah, apel ketujuh ditandai lingkaran oranye.",
        draw(c) {
          for (let i = 0; i < 7; i += 1) apple(c, 122 + i * 92, 300, 32);
          ring(c, 674, 300, 46, 5, colors.orange);
          strokeLine(c, 110, 380, 700, 380, 3, colors.muted);
        }
      },
      {
        alt: "Panel kiri berisi lima titik teal dengan garis penanda, panel kanan tiga titik biru.",
        draw(c) {
          comparePanels(
            c,
            (h, cx, cy) => {
              miniDots(h, cx, cy, 5, colors.teal, 52, 26);
              strokeLine(h, cx - 96, cy - 60, cx + 96, cy - 60, 4, colors.tealLight);
            },
            (h, cx, cy) => miniDots(h, cx, cy, 3, colors.blue, 52, 26)
          );
          chevron(c, 400, 300, 20, 1, colors.navy, 9);
        }
      },
      {
        alt: "Tiga kartu rangkuman: kerangka sepuluh berisi tujuh titik merah, lima titik berjajar, dan garis bilangan bertanda.",
        draw(c) {
          summaryTrio(c, [
            (h, cx, cy) => miniFrame(h, cx, cy, 7, colors.red),
            (h, cx, cy) => miniDots(h, cx, cy, 5, colors.teal, 32, 16),
            (h, cx, cy) => miniNumberLine(h, cx, cy, [[0, colors.red], [3, colors.blue], [7, colors.teal]])
          ]);
        }
      },
      {
        alt: "Kerangka sepuluh berisi tujuh titik merah dan tiga kotak kosong, di samping dua kelompok titik berisi lima dan tiga titik.",
        draw(c) {
          tenFrame(c, 60, 120, 7, colors.red);
          strokeLine(c, 60, 340, 700, 340, 3, colors.muted);
          dotRow(c, 120, 470, 5, 46, 20, colors.teal);
          chevron(c, 400, 470, 22, 1, colors.navy, 9);
          dotRow(c, 500, 470, 3, 46, 20, colors.blue);
        }
      }
    ]
  },
  {
    packageDir: "kelas1-matematika-b02-penjumlahan-10",
    base: "aktivitas-penjumlahan-10",
    summaryAlt: "Lima ilustrasi penjumlahan dan pengurangan sampai 10: dua titik ditambah tiga titik, lima titik dengan dua dicoret, dua tangan dengan jari terangkat, tiga kartu rangkuman, dan baris hitung dua sampai lima titik.",
    steps: [
      {
        alt: "Dua titik merah ditambah tiga titik biru menghasilkan lima titik teal.",
        draw(c) {
          dotRow(c, 110, 300, 2, 50, 22, colors.red);
          plusSign(c, 250, 300, 28, 9, colors.navy);
          dotRow(c, 320, 300, 3, 50, 22, colors.blue);
          equalsSign(c, 500, 300, 28, 9, colors.navy);
          dotRow(c, 580, 300, 5, 40, 18, colors.teal);
        }
      },
      {
        alt: "Lima titik teal dengan dua titik terakhir dicoret, tanda sama dengan, lalu tiga titik teal.",
        draw(c) {
          dotRow(c, 120, 300, 5, 50, 22, colors.teal);
          dashedLine(c, 330, 274, 362, 326, 5, colors.red);
          dashedLine(c, 362, 274, 330, 326, 5, colors.red);
          dashedLine(c, 380, 274, 412, 326, 5, colors.red);
          dashedLine(c, 412, 274, 380, 326, 5, colors.red);
          equalsSign(c, 480, 300, 26, 9, colors.navy);
          dotRow(c, 550, 300, 3, 50, 22, colors.teal);
        }
      },
      {
        alt: "Dua tangan terbuka, tangan kiri mengangkat dua jari dan tangan kanan mengangkat tiga jari dengan tanda tambah di antaranya.",
        draw(c) {
          hand(c, 220, 260, 0.95, [true, true, false, false, false]);
          plusSign(c, 400, 300, 30, 10, colors.navy);
          hand(c, 560, 260, 0.95, [true, true, true, false, false]);
        }
      },
      {
        alt: "Tiga kartu rangkuman: lima titik, lima titik dengan dua dicoret, dan dua ubin tanda tambah serta kurang.",
        draw(c) {
          summaryTrio(c, [
            (h, cx, cy) => miniDots(h, cx, cy, 5, colors.teal, 30, 14),
            (h, cx, cy) => miniCrossedDots(h, cx, cy, 5, 2),
            (h, cx, cy) => miniTiles(h, cx, cy)
          ]);
        }
      },
      {
        alt: "Baris atas: dua titik ditambah tiga titik menghasilkan lima titik. Baris bawah: lima titik dikurangi dua titik, dua di antaranya dicoret.",
        draw(c) {
          dotRow(c, 90, 170, 2, 56, 24, colors.red);
          plusSign(c, 250, 170, 26, 9, colors.navy);
          dotRow(c, 310, 170, 3, 56, 24, colors.blue);
          equalsSign(c, 480, 170, 26, 9, colors.navy);
          dotRow(c, 560, 170, 5, 50, 20, colors.teal);
          strokeLine(c, 60, 300, 740, 300, 3, colors.muted);
          dotRow(c, 90, 450, 5, 56, 24, colors.teal);
          minusSign(c, 400, 450, 26, 9, colors.navy);
          dotRow(c, 500, 450, 2, 56, 24, colors.red);
          dashedLine(c, 500, 410, 556, 490, 5, colors.red);
          dashedLine(c, 556, 410, 500, 490, 5, colors.red);
        }
      }
    ]
  },
  {
    packageDir: "kelas1-matematika-b03-bentuk-pola",
    base: "aktivitas-bentuk-pola",
    summaryAlt: "Lima ilustrasi bentuk dan pola: lingkaran besar dengan benda bulat, persegi berjendela, pita pola merah-kuning, tiga kartu rangkuman, dan dua pita pola berulang.",
    steps: [
      {
        alt: "Lingkaran merah besar, satu koin bundar, dan satu jam bundar.",
        draw(c) {
          fillCircle(c, 400, 270, 130, colors.red);
          ring(c, 400, 270, 130, 7, colors.navy);
          coin(c, 180, 480, 40, colors.sun);
          clockFace(c, 620, 470, 50, 3, 0);
        }
      },
      {
        alt: "Persegi kuning besar dengan tanda sisi sama panjang dan empat sudut siku-siku, dibagi menjadi empat jendela kecil.",
        draw(c) {
          fillRect(c, 290, 170, 220, 220, colors.sun);
          strokeRect(c, 290, 170, 220, 220, 6, colors.navy);
          equalSideMarks(c, 400, 280, 220);
          rightAngleMarks(c, 400, 280, 220);
          strokeLine(c, 400, 176, 400, 384, 4, colors.navy);
          strokeLine(c, 296, 280, 504, 280, 4, colors.navy);
        }
      },
      {
        alt: "Pita pola lingkaran merah dan persegi kuning bergantian, berakhir pada kotak kosong bergaris putus-putus.",
        draw(c) {
          patternStrip(c, 120, 300, ["circle", "square", "circle", "square"], { circle: colors.red, square: colors.sun }, 130, 44);
          dashedBox(c, 580, 258, 100, 84);
        }
      },
      {
        alt: "Tiga kartu rangkuman: lingkaran merah, persegi kuning, dan pita pola tiga bentuk.",
        draw(c) {
          summaryTrio(c, [
            (h, cx, cy) => drawShape(h, "circle", cx, cy, 130, { fill: colors.red }),
            (h, cx, cy) => drawShape(h, "square", cx, cy, 120, { fill: colors.sun }),
            (h, cx, cy) => patternStrip(h, cx - 56, cy, ["circle", "square", "circle"], { circle: colors.red, square: colors.sun }, 56, 30)
          ]);
        }
      },
      {
        alt: "Dua pita pola berulang: lingkaran merah dan persegi kuning bergantian, lalu segitiga biru dan lingkaran teal; setiap pita berakhir pada kotak kosong bergaris putus-putus.",
        draw(c) {
          const strip = (y, shapes) => {
            shapes.forEach((shape, index) => {
              const cx = 110 + index * 130;
              if (shape === "circle") {
                fillCircle(c, cx, y, 40, colors.red);
                ring(c, cx, y, 40, 5, colors.navy);
              } else if (shape === "square") {
                fillRect(c, cx - 40, y - 40, 80, 80, colors.sun);
                strokeRect(c, cx - 40, y - 40, 80, 80, 5, colors.navy);
              } else {
                triangle(c, cx, y, 50, 0, colors.blue);
              }
            });
            dashedBox(c, 630, y - 46, 90, 92);
          };
          strip(180, ["circle", "square", "circle", "square"]);
          strokeLine(c, 60, 300, 740, 300, 3, colors.muted);
          strip(440, ["triangle", "circle", "triangle", "circle"]);
        }
      }
    ]
  },
  {
    packageDir: "kelas1-matematika-b04-pengukuran",
    base: "aktivitas-pengukuran-sederhana",
    summaryAlt: "Lima ilustrasi pengukuran sederhana: jengkal tangan dengan rentang, timbangan dua lengan, jam dinding, tiga kartu alat ukur, dan meja yang diukur dengan jengkal.",
    steps: [
      {
        alt: "Tangan terbuka dengan garis rentang jengkal di bawahnya.",
        draw(c) {
          handSpan(c, 400, 230, 330, 0.95);
        }
      },
      {
        alt: "Timbangan dua lengan seimbang dengan apel di satu lengan dan beban kotak di lengan lain.",
        draw(c) {
          balanceScale(c, 400, 520, 130);
          apple(c, 270, 386, 26);
          fillRect(c, 500, 352, 72, 62, colors.blueLight);
          strokeRect(c, 500, 352, 72, 62, 5, colors.navy);
        }
      },
      {
        alt: "Jam dinding besar bertanda jarum jam dan menit, dengan lambang siang dan malam di sampingnya.",
        draw(c) {
          clockFace(c, 380, 280, 170, 10, 10);
          dayNight(c, 150, 480, 66);
        }
      },
      {
        alt: "Tiga kartu alat ukur: timbangan, jam, dan penggaris.",
        draw(c) {
          summaryTrio(c, [
            (h, cx, cy) => miniScale(h, cx, cy),
            (h, cx, cy) => miniClock(h, cx, cy, 3, 0),
            (h, cx, cy) => miniRuler(h, cx, cy)
          ]);
        }
      },
      {
        alt: "Meja dengan panjang diukur memakai garis jengkal dan tangan di dekatnya.",
        draw(c) {
          fillRect(c, 120, 160, 560, 54, colors.tealLight);
          strokeRect(c, 120, 160, 560, 54, 5, colors.navy);
          fillRect(c, 150, 214, 28, 130, colors.pale);
          strokeRect(c, 150, 214, 28, 130, 4, colors.navy);
          fillRect(c, 622, 214, 28, 130, colors.pale);
          strokeRect(c, 622, 214, 28, 130, 4, colors.navy);
          strokeLine(c, 120, 420, 680, 420, 5, colors.teal);
          strokeLine(c, 120, 404, 120, 436, 4, colors.teal);
          strokeLine(c, 400, 404, 400, 436, 4, colors.teal);
          strokeLine(c, 680, 404, 680, 436, 4, colors.teal);
          hand(c, 100, 470, 0.55, [true, true, true, true, true]);
        }
      }
    ]
  },
  {
    packageDir: "kelas1-matematika-b05-bilangan-11-20",
    base: "aktivitas-bilangan-11-20",
    summaryAlt: "Lima ilustrasi bilangan 11–20: kerangka sepuluh dengan lima lalu enam titik, kerangka sepuluh dengan sembilan titik, kerangka sepuluh dengan tujuh titik diamati, tiga kartu rangkuman, dan dua kerangka sepuluh penuh serta tujuh titik.",
    steps: [
      {
        alt: "Baris atas kerangka sepuluh penuh dan kerangka lima titik, panah ke bawah menuju kerangka sepuluh dan kerangka enam titik.",
        draw(c) {
          tenFrame(c, 80, 140, 10, colors.teal, 34, 6);
          tenFrame(c, 300, 140, 5, colors.blue, 34, 6);
          arrow(c, 580, 150, 580, 240, 6, colors.navy, 16);
          tenFrame(c, 80, 330, 10, colors.teal, 34, 6);
          tenFrame(c, 300, 330, 6, colors.red, 34, 6);
        }
      },
      {
        alt: "Kerangka sepuluh penuh dan kerangka sembilan titik, satu kotak kosong terakhir ditandai garis putus-putus.",
        draw(c) {
          tenFrame(c, 80, 150, 10, colors.teal, 34, 6);
          tenFrame(c, 300, 150, 9, colors.blue, 34, 6);
          dashedBox(c, 460, 190, 34, 34);
          chevron(c, 620, 207, 24, -1, colors.navy, 8);
        }
      },
      {
        alt: "Kerangka sepuluh penuh, kerangka tujuh titik merah, dan kaca pembesar di samping kelompok tujuh.",
        draw(c) {
          tenFrame(c, 80, 200, 10, colors.teal, 34, 6);
          tenFrame(c, 300, 200, 7, colors.red, 34, 6);
          fillCircle(c, 566, 270, 58, colors.sky);
          ring(c, 566, 270, 58, 12, colors.navy);
          strokeLine(c, 608, 312, 660, 364, 20, colors.teal);
        }
      },
      {
        alt: "Tiga kartu rangkuman: kerangka sepuluh penuh, kerangka enam titik, dan garis bilangan bertanda.",
        draw(c) {
          summaryTrio(c, [
            (h, cx, cy) => miniFrame(h, cx, cy, 10, colors.teal),
            (h, cx, cy) => miniFrame(h, cx, cy, 6, colors.red),
            (h, cx, cy) => miniNumberLine(h, cx, cy, [[4, colors.teal], [7, colors.red]])
          ]);
        }
      },
      {
        alt: "Dua kerangka sepuluh: kerangka pertama penuh sepuluh titik, kerangka kedua berisi tujuh titik.",
        draw(c) {
          tenFrame(c, 60, 160, 10, colors.red);
          tenFrame(c, 430, 160, 7, colors.red);
          strokeLine(c, 60, 400, 740, 400, 3, colors.muted);
          dotRow(c, 120, 480, 10, 46, 14, colors.teal);
        }
      }
    ]
  },
  {
    packageDir: "kelas1-matematika-b06-penjumlahan-20",
    base: "aktivitas-penjumlahan-20",
    summaryAlt: "Lima ilustrasi penjumlahan dan pengurangan sampai 20: kerangka sepuluh dan dua titik ditambah lima titik, pengurangan delapan belas dikurangi empat, dua kerangka sepuluh, tiga kartu rangkuman, dan susunan kerangka dua puluh.",
    steps: [
      {
        alt: "Kerangka sepuluh dan dua titik ditambah lima titik, panah menuju kerangka sepuluh dan tujuh titik.",
        draw(c) {
          tenFrame(c, 60, 100, 10, colors.teal, 30, 5);
          tenFrame(c, 250, 100, 2, colors.blue, 30, 5);
          plusSign(c, 465, 132, 24, 8, colors.navy);
          dotRow(c, 520, 132, 5, 44, 18, colors.red);
          arrow(c, 560, 220, 560, 320, 6, colors.navy, 16);
          tenFrame(c, 60, 360, 10, colors.green, 30, 5);
          tenFrame(c, 250, 360, 7, colors.green, 30, 5);
        }
      },
      {
        alt: "Kerangka sepuluh dan delapan titik dikurangi empat titik tercoret, panah menuju kerangka sepuluh dan empat titik.",
        draw(c) {
          tenFrame(c, 60, 100, 10, colors.teal, 30, 5);
          tenFrame(c, 250, 100, 8, colors.blue, 30, 5);
          minusSign(c, 465, 132, 24, 8, colors.navy);
          miniCrossedDots(c, 610, 132, 4, 4);
          arrow(c, 560, 220, 560, 320, 6, colors.navy, 16);
          tenFrame(c, 60, 360, 10, colors.green, 30, 5);
          tenFrame(c, 250, 360, 4, colors.green, 30, 5);
        }
      },
      {
        alt: "Dua kerangka sepuluh penuh dengan tanda tambah, di bawahnya dua kerangka sepuluh penuh berdempet sebagai dua puluh titik.",
        draw(c) {
          tenFrame(c, 140, 200, 10, colors.teal, 34, 6);
          plusSign(c, 390, 265, 30, 10, colors.navy);
          tenFrame(c, 450, 200, 10, colors.blue, 34, 6);
          tenFrame(c, 250, 390, 10, colors.green, 30, 0);
          tenFrame(c, 400, 390, 10, colors.green, 30, 0);
          strokeLine(c, 250, 490, 550, 490, 5, colors.teal);
          strokeLine(c, 250, 476, 250, 504, 4, colors.teal);
          strokeLine(c, 550, 476, 550, 504, 4, colors.teal);
        }
      },
      {
        alt: "Tiga kartu rangkuman: kerangka sepuluh, lima titik dengan dua dicoret, dan ubin tambah serta kurang.",
        draw(c) {
          summaryTrio(c, [
            (h, cx, cy) => miniFrame(h, cx, cy, 10, colors.teal),
            (h, cx, cy) => miniCrossedDots(h, cx, cy, 5, 2),
            (h, cx, cy) => miniTiles(h, cx, cy)
          ]);
        }
      },
      {
        alt: "Kerangka sepuluh penuh ditambah dua titik, lalu tanda tambah dan lima titik di sampingnya.",
        draw(c) {
          tenFrame(c, 50, 150, 10, colors.teal);
          dotRow(c, 60, 330, 2, 50, 20, colors.blue);
          plusSign(c, 440, 250, 26, 9, colors.navy);
          dotRow(c, 510, 250, 5, 50, 20, colors.red);
          strokeLine(c, 60, 430, 740, 430, 3, colors.muted);
          tenFrame(c, 380, 450, 7, colors.teal);
        }
      }
    ]
  },
  {
    packageDir: "kelas1-matematika-b07-bangun-datar",
    base: "aktivitas-bangun-datar",
    summaryAlt: "Lima ilustrasi bangun datar sederhana: lingkaran dengan benda bulat, persegi bertanda sisi, segitiga dengan benda bersudut tiga, tiga kartu bangun, dan empat bangun datar berjajar.",
    steps: [
      {
        alt: "Lingkaran teal besar, koin bundar, dan jam bundar.",
        draw(c) {
          fillCircle(c, 400, 260, 130, colors.teal);
          ring(c, 400, 260, 130, 7, colors.navy);
          coin(c, 180, 480, 40, colors.sun);
          clockFace(c, 620, 470, 50, 3, 0);
        }
      },
      {
        alt: "Persegi kuning besar dengan tanda sisi sama panjang dan empat sudut siku-siku.",
        draw(c) {
          fillRect(c, 280, 170, 240, 240, colors.sun);
          strokeRect(c, 280, 170, 240, 240, 6, colors.navy);
          equalSideMarks(c, 400, 290, 240);
          rightAngleMarks(c, 400, 290, 240);
        }
      },
      {
        alt: "Segitiga biru besar, di bawahnya tiga segitiga kecil berwarna teal, oranye, dan hijau.",
        draw(c) {
          triangle(c, 400, 290, 200, 0, colors.blue);
          triangle(c, 170, 500, 60, 0, colors.teal);
          triangle(c, 340, 500, 60, 180, colors.orange);
          triangle(c, 510, 500, 60, 0, colors.green);
        }
      },
      {
        alt: "Tiga kartu rangkuman: lingkaran teal, persegi bertanda, dan segitiga biru.",
        draw(c) {
          summaryTrio(c, [
            (h, cx, cy) => drawShape(h, "circle", cx, cy, 130, { fill: colors.teal }),
            (h, cx, cy) => {
              drawShape(h, "square", cx, cy, 120, { fill: colors.sun });
              equalSideMarks(h, cx, cy, 120);
            },
            (h, cx, cy) => drawShape(h, "triangle", cx, cy, 130, { fill: colors.blue })
          ]);
        }
      },
      {
        alt: "Empat bangun datar berjajar: lingkaran teal, persegi kuning, segitiga biru, dan persegi panjang merah muda.",
        draw(c) {
          fillCircle(c, 130, 300, 80, colors.teal);
          ring(c, 130, 300, 80, 6, colors.navy);
          fillRect(c, 250, 220, 160, 160, colors.sun);
          strokeRect(c, 250, 220, 160, 160, 6, colors.navy);
          triangle(c, 540, 300, 92, 0, colors.blue);
          fillRect(c, 620, 250, 130, 100, colors.redLight);
          strokeRect(c, 620, 250, 130, 100, 6, colors.navy);
        }
      }
    ]
  },
  {
    packageDir: "kelas1-matematika-b08-pola-bilangan",
    base: "aktivitas-pola-bilangan",
    summaryAlt: "Lima ilustrasi pola bilangan: menara satu sampai tiga dengan menara kosong, menara dua sampai enam dengan menara kosong, tiang titik lima sepuluh lima belas dengan tiang kosong, tiga kartu rangkuman, dan menara titik bertambah.",
    steps: [
      {
        alt: "Tiga menara kubus bertambah satu, satu, dua, dan tiga, lalu menara kosong bergaris putus-putus setinggi empat.",
        draw(c) {
          towerRow(c, 170, 430, [1, 2, 3], colors.teal, 44, 50);
          dashedBox(c, 452, 254, 44, 176);
        }
      },
      {
        alt: "Tiga menara kubus dua, empat, dan enam, lalu menara kosong bergaris putus-putus setinggi delapan.",
        draw(c) {
          towerRow(c, 140, 470, [2, 4, 6], colors.blue, 26, 60);
          dashedBox(c, 398, 262, 26, 208);
        }
      },
      {
        alt: "Tiga tiang titik berisi lima, sepuluh, dan lima belas titik, lalu tiang kosong bergaris putus-putus.",
        draw(c) {
          dotColumn(c, 180, 500, 5, colors.teal, 16, 7);
          dotColumn(c, 330, 500, 10, colors.teal, 16, 7);
          dotColumn(c, 480, 500, 15, colors.teal, 16, 7);
          dashedBox(c, 610, 180, 24, 320);
        }
      },
      {
        alt: "Tiga kartu rangkuman: tiang titik satu sampai tiga, tiang dua sampai empat, dan tiang lima serta sepuluh.",
        draw(c) {
          summaryTrio(c, [
            (h, cx, cy) => {
              for (let i = 0; i < 3; i += 1) dotColumn(h, cx - 40 + i * 40, cy + 80, i + 1, colors.teal, 18, 6);
            },
            (h, cx, cy) => {
              dotColumn(h, cx - 40, cy + 80, 2, colors.blue, 16, 6);
              dotColumn(h, cx, cy + 80, 4, colors.blue, 16, 6);
              dotColumn(h, cx + 40, cy + 80, 6, colors.blue, 16, 6);
            },
            (h, cx, cy) => {
              dotColumn(h, cx - 40, cy + 90, 5, colors.teal, 14, 6);
              dotColumn(h, cx, cy + 90, 10, colors.teal, 14, 6);
              dashedBox(h, cx + 30, cy + 90 - 20 * 14, 20, 20 * 14);
            }
          ]);
        }
      },
      {
        alt: "Menara titik bertambah satu: satu, dua, tiga, empat titik. Di bawahnya menara dua, empat, dan enam titik, masing-masing diikuti menara kosong bergaris putus-putus.",
        draw(c) {
          const tower = (x, baseY, count, color, unitSize = 34) => {
            for (let i = 0; i < count; i += 1) {
              fillRect(c, x, baseY - (i + 1) * unitSize, unitSize, unitSize, color);
              strokeRect(c, x, baseY - (i + 1) * unitSize, unitSize, unitSize, 4, colors.navy);
            }
          };
          for (let i = 1; i <= 4; i += 1) tower(80 + (i - 1) * 110, 240, i, colors.teal);
          dashedBox(c, 520, 106, 34, 134);
          strokeLine(c, 60, 300, 700, 300, 3, colors.muted);
          for (let i = 1; i <= 3; i += 1) tower(80 + (i - 1) * 150, 560, i * 2, colors.blue, 26);
          dashedBox(c, 530, 404, 26, 156);
        }
      }
    ]
  }
];

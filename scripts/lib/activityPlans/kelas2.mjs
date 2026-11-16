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
  star,
  strokeLine,
  strokeRect,
  triangle
} from "../illustrationKit.mjs";
import {
  apple,
  balanceScale,
  barChart,
  chevron,
  clockFace,
  coin,
  comparePanels,
  dashedBox,
  dayNight,
  dotArray,
  dotRow,
  drawShape,
  equalSideMarks,
  flat,
  miniBarChart,
  miniBars,
  miniClock,
  miniGrid,
  miniMoney,
  miniNumberLine,
  miniRuler,
  miniScale,
  miniTable,
  miniTiles,
  note,
  operationTile,
  placeValueBoard,
  ringAround,
  ringDots,
  rightAngleMarks,
  rod,
  ruler,
  summaryTrio,
  tableGrid,
  tapeMeasure,
  tenFrame,
  unit
} from "../activityScenes.mjs";

function unitGrid(c, x, y, count, size = 26, gap = 6, columns = 2) {
  for (let i = 0; i < count; i += 1) {
    unit(c, x + (i % columns) * (size + gap), y + Math.floor(i / columns) * (size + gap), size);
  }
}

function dotCell(c, cx, cy, count) {
  dotRow(c, cx - ((count - 1) * 26) / 2, cy, count, 26, 9, colors.teal);
}

export const PLAN = [
  {
    packageDir: "kelas2-matematika-b01-bilangan-1-100",
    base: "aktivitas-bilangan-1-100",
    summaryAlt: "Lima ilustrasi bilangan 1–100: batang puluhan dengan sembilan satuan menuju empat puluhan, tabel nilai tempat empat puluhan dan tujuh satuan, perbandingan lima dan delapan batang, tiga kartu rangkuman, dan dua kelompok puluhan dengan satuan.",
    steps: [
      {
        alt: "Tiga batang puluhan dan sembilan satuan, panah menuju empat batang puluhan.",
        draw(c) {
          for (let i = 0; i < 3; i += 1) rod(c, 70 + i * 26, 180, 150);
          unitGrid(c, 180, 210, 9);
          arrow(c, 300, 260, 380, 260, 7, colors.navy, 16);
          for (let i = 0; i < 4; i += 1) rod(c, 420 + i * 26, 180, 150);
        }
      },
      {
        alt: "Tabel nilai tempat berisi empat batang puluhan di kolom kiri dan tujuh satuan di kolom kanan.",
        draw(c) {
          placeValueBoard(c, 60, 110, 680, 380, [
            { kind: "rod", count: 4 },
            { kind: "unit", count: 7 }
          ]);
        }
      },
      {
        alt: "Lima batang puluhan di baris atas dan delapan batang puluhan di baris bawah yang lebih panjang.",
        draw(c) {
          for (let i = 0; i < 5; i += 1) rod(c, 100 + i * 24, 200, 140);
          for (let i = 0; i < 8; i += 1) rod(c, 100 + i * 24, 400, 140);
          strokeLine(c, 100, 570, 740, 570, 3, colors.muted);
          dashedLine(c, 100 + 5 * 24 - 6, 170, 100 + 5 * 24 - 6, 570, 4, colors.orange);
          arrow(c, 240, 480, 300, 480, 6, colors.teal, 14);
        }
      },
      {
        alt: "Tiga kartu rangkuman: batang puluhan dengan satuan, dua batang berbeda panjang, dan garis bilangan bertanda.",
        draw(c) {
          summaryTrio(c, [
            (h, cx, cy) => {
              for (let i = 0; i < 3; i += 1) rod(h, cx - 46 + i * 20, cy - 50, 90, 14);
              unitGrid(h, cx, cy + 52, 6, 14, 4);
            },
            (h, cx, cy) => miniBars(h, cx, cy, [5, 8]),
            (h, cx, cy) => miniNumberLine(h, cx, cy, [[3, colors.teal], [8, colors.blue]])
          ]);
        }
      },
      {
        alt: "Kelompok delapan batang puluhan dan lima satuan di kiri, kelompok lima batang puluhan dan delapan satuan di kanan, kelompok delapan ditandai oranye.",
        draw(c) {
          strokeRect(c, 70, 120, 300, 400, 6, colors.orange);
          for (let i = 0; i < 8; i += 1) rod(c, 100 + i * 24, 170, 240);
          unitGrid(c, 120, 430, 5, 26, 6);
          for (let i = 0; i < 5; i += 1) rod(c, 470 + i * 24, 170, 240);
          unitGrid(c, 480, 430, 8, 26, 6);
          chevron(c, 410, 320, 24, -1, colors.navy, 9);
        }
      }
    ]
  },
  {
    packageDir: "kelas2-matematika-b02-penjumlahan-100",
    base: "aktivitas-penjumlahan-100",
    summaryAlt: "Lima ilustrasi penjumlahan dan pengurangan sampai 100: empat puluhan lima satuan ditambah tiga puluhan dua satuan, delapan puluhan dikurangi dua puluhan lima satuan, lima puluhan ditambah lima puluhan menjadi seratus, tiga kartu rangkuman, dan hasil tujuh puluhan tujuh satuan.",
    steps: [
      {
        alt: "Empat batang puluhan dan lima satuan ditambah tiga batang puluhan dan dua satuan, panah menuju tujuh batang puluhan dan tujuh satuan.",
        draw(c) {
          for (let i = 0; i < 4; i += 1) rod(c, 90 + i * 24, 140, 150);
          unitGrid(c, 100, 320, 5, 24, 6);
          plusSign(c, 400, 230, 30, 10, colors.navy);
          for (let i = 0; i < 3; i += 1) rod(c, 480 + i * 24, 140, 150);
          unitGrid(c, 490, 320, 2, 24, 6);
          arrow(c, 400, 390, 400, 450, 7, colors.navy, 16);
          for (let i = 0; i < 7; i += 1) rod(c, 300 + i * 24, 470, 90, 16);
          unitGrid(c, 320, 560, 7, 16, 4);
        }
      },
      {
        alt: "Delapan batang puluhan dikurangi dua batang puluhan dan lima satuan yang ditandai kotak putus-putus, panah menuju lima puluhan lima satuan.",
        draw(c) {
          for (let i = 0; i < 8; i += 1) rod(c, 80 + i * 24, 140, 150);
          minusSign(c, 400, 230, 30, 10, colors.navy);
          dashedBox(c, 450, 120, 160, 220, colors.red);
          for (let i = 0; i < 2; i += 1) rod(c, 480 + i * 24, 140, 150);
          unitGrid(c, 560, 320, 5, 24, 6);
          arrow(c, 520, 390, 520, 450, 7, colors.navy, 16);
          for (let i = 0; i < 5; i += 1) rod(c, 300 + i * 24, 470, 90, 16);
          unitGrid(c, 320, 560, 5, 16, 4);
        }
      },
      {
        alt: "Lima batang puluhan ditambah lima batang puluhan, panah menuju satu persegi ratusan.",
        draw(c) {
          for (let i = 0; i < 5; i += 1) rod(c, 130 + i * 24, 150, 140);
          plusSign(c, 400, 220, 30, 10, colors.navy);
          for (let i = 0; i < 5; i += 1) rod(c, 600 + i * 24, 150, 140);
          arrow(c, 400, 330, 400, 400, 7, colors.navy, 16);
          flat(c, 330, 420, 140);
        }
      },
      {
        alt: "Tiga kartu rangkuman: batang puluhan dengan satuan, ubin tambah dan kurang, serta petak seratus.",
        draw(c) {
          summaryTrio(c, [
            (h, cx, cy) => {
              for (let i = 0; i < 4; i += 1) rod(h, cx - 50 + i * 18, cy - 50, 90, 12);
              unitGrid(h, cx + 2, cy + 52, 3, 14, 4);
            },
            (h, cx, cy) => miniTiles(h, cx, cy),
            (h, cx, cy) => miniGrid(h, cx, cy, 10, 10, 100, 14)
          ]);
        }
      },
      {
        alt: "Empat batang puluhan dan lima satuan digabung dengan tiga batang puluhan dan dua satuan; hasilnya tujuh batang puluhan dan tujuh satuan.",
        draw(c) {
          for (let i = 0; i < 4; i += 1) rod(c, 80 + i * 26, 150, 180);
          for (let i = 0; i < 5; i += 1) unit(c, 200 + i * 26, 360);
          plusSign(c, 320, 260, 24, 8, colors.navy);
          for (let i = 0; i < 3; i += 1) rod(c, 360 + i * 26, 150, 180);
          for (let i = 0; i < 2; i += 1) unit(c, 460 + i * 26, 360);
          equalsSign(c, 520, 260, 22, 8, colors.navy);
          for (let i = 0; i < 7; i += 1) rod(c, 570 + i * 26, 150, 180);
          for (let i = 0; i < 7; i += 1) unit(c, 560 + i * 26, 360);
          strokeLine(c, 60, 440, 740, 440, 3, colors.muted);
          dotRow(c, 90, 500, 10, 42, 12, colors.teal);
          dotRow(c, 540, 500, 10, 20, 8, colors.blue);
        }
      }
    ]
  },
  {
    packageDir: "kelas2-matematika-b03-perkalian-dasar",
    base: "aktivitas-perkalian-dasar",
    summaryAlt: "Lima ilustrasi perkalian dasar: susunan tiga kali dua titik dengan kurung, susunan dua kali empat titik, tiga lingkaran berisi lima titik, tiga kartu rangkuman, dan penjumlahan berulang tiga kelompok empat bintang.",
    steps: [
      {
        alt: "Susunan tiga kolom dua baris titik dengan kurung baris dan kolom, tanda sama dengan, lalu enam titik berjajar.",
        draw(c) {
          dotArray(c, 130, 200, 3, 2, 80, 20, colors.teal);
          strokeLine(c, 120, 160, 340, 160, 3, colors.navy);
          strokeLine(c, 120, 160, 120, 152, 3, colors.navy);
          strokeLine(c, 340, 160, 340, 152, 3, colors.navy);
          strokeLine(c, 390, 200, 390, 280, 3, colors.navy);
          strokeLine(c, 390, 200, 398, 200, 3, colors.navy);
          strokeLine(c, 390, 280, 398, 280, 3, colors.navy);
          equalsSign(c, 450, 240, 24, 8, colors.navy);
          dotRow(c, 520, 240, 6, 44, 16, colors.teal);
        }
      },
      {
        alt: "Susunan dua kolom empat baris titik dengan kurung baris dan kolom, lalu delapan titik berjajar.",
        draw(c) {
          dotArray(c, 150, 140, 2, 4, 80, 20, colors.blue);
          strokeLine(c, 140, 100, 300, 100, 3, colors.navy);
          strokeLine(c, 140, 100, 140, 92, 3, colors.navy);
          strokeLine(c, 300, 100, 300, 92, 3, colors.navy);
          strokeLine(c, 350, 140, 350, 420, 3, colors.navy);
          strokeLine(c, 350, 140, 358, 140, 3, colors.navy);
          strokeLine(c, 350, 420, 358, 420, 3, colors.navy);
          equalsSign(c, 420, 280, 24, 8, colors.navy);
          dotRow(c, 490, 280, 8, 40, 14, colors.blue);
        }
      },
      {
        alt: "Tiga lingkaran berisi lima titik masing-masing, tersusun mendatar.",
        draw(c) {
          for (let g = 0; g < 3; g += 1) {
            const cx = 180 + g * 220;
            ringAround(c, cx, 300, 88, 5, colors.blue);
            dotRow(c, cx - 64, 278, 3, 32, 12, colors.teal);
            dotRow(c, cx - 48, 322, 2, 32, 12, colors.teal);
          }
        }
      },
      {
        alt: "Tiga kartu rangkuman: susunan tiga kali dua bintang, dua lingkaran berisi tiga titik, dan ubin kali serta bagi.",
        draw(c) {
          summaryTrio(c, [
            (h, cx, cy) => {
              for (let row = 0; row < 2; row += 1) {
                for (let column = 0; column < 3; column += 1) {
                  star(h, cx - 44 + column * 44, cy - 30 + row * 60, 16, colors.sun, 2);
                }
              }
            },
            (h, cx, cy) => {
              ringAround(h, cx - 55, cy, 46, 4, colors.blue);
              ringAround(h, cx + 55, cy, 46, 4, colors.blue);
              dotRow(h, cx - 80, cy, 3, 24, 8, colors.teal);
              dotRow(h, cx + 30, cy, 3, 24, 8, colors.teal);
            },
            (h, cx, cy) => {
              operationTile(h, cx - 40, cy, 68, "times");
              operationTile(h, cx + 40, cy, 68, "divide");
            }
          ]);
        }
      },
      {
        alt: "Tiga kelompok berisi empat bintang dipisah tanda tambah, di bawahnya dua belas bintang berjajar.",
        draw(c) {
          for (let g = 0; g < 3; g += 1) {
            const cx = 140 + g * 260;
            for (let i = 0; i < 4; i += 1) {
              star(c, cx - 33 + (i % 2) * 66, 180 + Math.floor(i / 2) * 66, 24, colors.sun, 3);
            }
            if (g < 2) plusSign(c, cx + 130, 213, 26, 9, colors.navy);
          }
          strokeLine(c, 80, 330, 720, 330, 3, colors.muted);
          for (let i = 0; i < 12; i += 1) star(c, 130 + i * 46, 460, 18, colors.sun, 2);
        }
      }
    ]
  },
  {
    packageDir: "kelas2-matematika-b04-pengukuran",
    base: "aktivitas-pengukuran",
    summaryAlt: "Lima ilustrasi pengukuran panjang dan berat: penggaris dengan pensil serta meteran, timbangan dua lengan, perbandingan meja dan pensil, tiga kartu alat ukur, dan penggaris dengan satu sentimeter ditandai.",
    steps: [
      {
        alt: "Penggaris dengan pensil di atasnya dan meteran gulung di sampingnya.",
        draw(c) {
          ruler(c, 60, 300, 400, 60, 30);
          fillRect(c, 90, 260, 300, 24, colors.orange);
          strokeRect(c, 90, 260, 300, 24, 4, colors.navy);
          strokeLine(c, 390, 260, 414, 272, 4, colors.navy);
          strokeLine(c, 390, 284, 414, 272, 4, colors.navy);
          tapeMeasure(c, 490, 280, 250);
        }
      },
      {
        alt: "Timbangan dua lengan dengan dua apel di satu lengan dan beban kotak di lengan lain.",
        draw(c) {
          balanceScale(c, 400, 520, 130);
          apple(c, 250, 388, 22);
          apple(c, 292, 388, 22);
          fillRect(c, 500, 350, 74, 64, colors.blueLight);
          strokeRect(c, 500, 350, 74, 64, 5, colors.navy);
        }
      },
      {
        alt: "Batang panjang sebagai meja di atas dan pensil pendek di bawahnya, selisihnya ditandai garis putus-putus.",
        draw(c) {
          fillRect(c, 100, 160, 580, 54, colors.tealLight);
          strokeRect(c, 100, 160, 580, 54, 5, colors.navy);
          fillRect(c, 130, 214, 26, 90, colors.pale);
          strokeRect(c, 130, 214, 26, 90, 4, colors.navy);
          fillRect(c, 624, 214, 26, 90, colors.pale);
          strokeRect(c, 624, 214, 26, 90, 4, colors.navy);
          strokeLine(c, 100, 400, 740, 400, 3, colors.muted);
          fillRect(c, 100, 450, 230, 30, colors.orange);
          strokeRect(c, 100, 450, 230, 30, 4, colors.navy);
          dashedLine(c, 100, 380, 680, 380, 4, colors.orange);
        }
      },
      {
        alt: "Tiga kartu alat ukur: penggaris, timbangan, dan dua batang panjang berbeda.",
        draw(c) {
          summaryTrio(c, [
            (h, cx, cy) => miniRuler(h, cx, cy),
            (h, cx, cy) => miniScale(h, cx, cy),
            (h, cx, cy) => miniBars(h, cx, cy, [90, 25])
          ]);
        }
      },
      {
        alt: "Penggaris panjang dengan pensil di atasnya, satu bagian sentimeter ditandai oranye dan diperbesar kaca pembesar.",
        draw(c) {
          ruler(c, 60, 320, 680, 80, 30);
          fillRect(c, 80, 270, 520, 24, colors.orange);
          strokeRect(c, 80, 270, 520, 24, 4, colors.navy);
          strokeRect(c, 82.6, 320, 22.6, 80, 5, colors.orange);
          fillCircle(c, 96, 200, 52, colors.sky);
          ring(c, 96, 200, 52, 10, colors.navy);
          strokeLine(c, 134, 238, 176, 280, 16, colors.teal);
        }
      }
    ]
  },
  {
    packageDir: "kelas2-matematika-b05-perkalian-pembagian",
    base: "aktivitas-perkalian-pembagian",
    summaryAlt: "Lima ilustrasi perkalian dan pembagian: susunan tiga kali dua titik, enam titik dibagi dua lingkaran, hubungan perkalian dan pembagian dengan panah dua arah, tiga kartu rangkuman, dan pengelompokan enam titik.",
    steps: [
      {
        alt: "Susunan tiga kolom dua baris titik dengan kurung, tanda sama dengan, lalu enam titik berjajar.",
        draw(c) {
          dotArray(c, 130, 200, 3, 2, 80, 20, colors.teal);
          strokeLine(c, 120, 160, 340, 160, 3, colors.navy);
          strokeLine(c, 120, 160, 120, 152, 3, colors.navy);
          strokeLine(c, 340, 160, 340, 152, 3, colors.navy);
          equalsSign(c, 410, 240, 24, 8, colors.navy);
          dotRow(c, 470, 240, 6, 44, 16, colors.teal);
        }
      },
      {
        alt: "Enam titik berjajar di atas, ubin bagi, lalu dua lingkaran berisi tiga titik.",
        draw(c) {
          dotRow(c, 150, 150, 6, 60, 22, colors.teal);
          operationTile(c, 400, 270, 76, "divide");
          for (let g = 0; g < 2; g += 1) {
            const cx = 250 + g * 300;
            ringAround(c, cx, 460, 80, 5, colors.blue);
            dotRow(c, cx - 40, 460, 3, 40, 13, colors.teal);
          }
        }
      },
      {
        alt: "Kotak susunan tiga kali dua titik dan ubin kali di kiri atas, kotak dua lingkaran berisi tiga titik dan ubin bagi di kanan bawah, panah dua arah di antaranya.",
        draw(c) {
          fillRect(c, 60, 80, 300, 200, colors.pale);
          strokeRect(c, 60, 80, 300, 200, 4, colors.muted);
          circlePanelGrid(c, 210, 180);
          operationTile(c, 400, 180, 70, "times");
          fillRect(c, 430, 320, 310, 200, colors.pale);
          strokeRect(c, 430, 320, 310, 200, 4, colors.muted);
          for (let g = 0; g < 2; g += 1) {
            const cx = 520 + g * 130;
            ringAround(c, cx, 420, 58, 4, colors.blue);
            dotRow(c, cx - 32, 420, 3, 32, 11, colors.teal);
          }
          operationTile(c, 400, 420, 70, "divide");
          arrow(c, 368, 250, 412, 300, 6, colors.teal, 12);
          arrow(c, 412, 360, 368, 300, 6, colors.orange, 12);
        }
      },
      {
        alt: "Tiga kartu rangkuman: susunan tiga kali dua titik, dua lingkaran berisi tiga titik, dan ubin kali serta bagi.",
        draw(c) {
          summaryTrio(c, [
            (h, cx, cy) => {
              dotArray(h, cx - 60, cy - 40, 3, 2, 60, 16, colors.teal);
            },
            (h, cx, cy) => {
              ringAround(h, cx - 55, cy, 46, 4, colors.blue);
              ringAround(h, cx + 55, cy, 46, 4, colors.blue);
              dotRow(h, cx - 80, cy, 3, 24, 8, colors.teal);
              dotRow(h, cx + 30, cy, 3, 24, 8, colors.teal);
            },
            (h, cx, cy) => {
              operationTile(h, cx - 40, cy, 68, "times");
              operationTile(h, cx + 40, cy, 68, "divide");
            }
          ]);
        }
      },
      {
        alt: "Susunan dua baris tiga titik, lalu enam titik yang sama dikelompokkan menjadi dua lingkaran berisi tiga titik.",
        draw(c) {
          dotArray(c, 160, 220, 3, 2, 76, 20, colors.teal);
          arrow(c, 390, 250, 470, 250, 6, colors.navy);
          ringAround(c, 560, 230, 66, 5, colors.blue);
          ringAround(c, 560, 390, 66, 5, colors.blue);
          dotRow(c, 520, 230, 3, 40, 14, colors.teal);
          dotRow(c, 520, 390, 3, 40, 14, colors.teal);
        }
      }
    ]
  },
  {
    packageDir: "kelas2-matematika-b06-bangun-datar",
    base: "aktivitas-bangun-datar-kelas2",
    summaryAlt: "Lima ilustrasi bangun datar: lingkaran besar dengan benda bulat, persegi berjendela dengan tanda sisi, segitiga dengan benda bersudut tiga, tiga kartu bangun, dan empat bangun dengan cirinya.",
    steps: [
      {
        alt: "Lingkaran teal besar dengan dua benda bulat kecil di bawahnya.",
        draw(c) {
          fillCircle(c, 400, 250, 150, colors.teal);
          ring(c, 400, 250, 150, 7, colors.navy);
          fillCircle(c, 180, 480, 46, colors.sky);
          ring(c, 180, 480, 46, 5, colors.navy);
          fillCircle(c, 620, 480, 46, colors.sun);
          ring(c, 620, 480, 46, 5, colors.navy);
        }
      },
      {
        alt: "Persegi kuning besar dengan tanda sisi sama panjang, empat sudut siku-siku, dan jendela empat petak.",
        draw(c) {
          fillRect(c, 280, 150, 240, 240, colors.sun);
          strokeRect(c, 280, 150, 240, 240, 6, colors.navy);
          equalSideMarks(c, 400, 270, 240);
          rightAngleMarks(c, 400, 270, 240);
          strokeLine(c, 400, 156, 400, 384, 4, colors.navy);
          strokeLine(c, 286, 270, 514, 270, 4, colors.navy);
          strokeLine(c, 60, 520, 740, 520, 3, colors.muted);
          fillRect(c, 100, 430, 120, 60, colors.pale);
          strokeRect(c, 100, 430, 120, 60, 4, colors.navy);
        }
      },
      {
        alt: "Segitiga biru besar dengan tiga segitiga kecil berwarna teal, oranye, dan hijau di bawahnya.",
        draw(c) {
          triangle(c, 400, 280, 200, 0, colors.blue);
          triangle(c, 170, 480, 60, 0, colors.teal);
          triangle(c, 340, 480, 60, 180, colors.orange);
          triangle(c, 510, 480, 60, 0, colors.green);
        }
      },
      {
        alt: "Tiga kartu rangkuman: lingkaran teal, persegi bertanda sisi, dan persegi panjang merah muda.",
        draw(c) {
          summaryTrio(c, [
            (h, cx, cy) => drawShape(h, "circle", cx, cy, 130, { fill: colors.teal }),
            (h, cx, cy) => {
              drawShape(h, "square", cx, cy, 120, { fill: colors.sun });
              equalSideMarks(h, cx, cy, 120);
            },
            (h, cx, cy) => drawShape(h, "rectangle", cx, cy, 130, { fill: colors.redLight })
          ]);
        }
      },
      {
        alt: "Persegi dengan tanda sisi sama panjang, persegi panjang, lingkaran, dan segitiga.",
        draw(c) {
          fillRect(c, 70, 200, 150, 150, colors.sun);
          strokeRect(c, 70, 200, 150, 150, 6, colors.navy);
          for (const [tx, ty, dx, dy] of [
            [145, 200, 0, 22],
            [145, 350, 0, -22],
            [70, 275, 22, 0],
            [220, 275, -22, 0]
          ]) {
            strokeLine(c, tx - dx / 2, ty - dy / 2, tx + dx / 2, ty + dy / 2, 4, colors.navy);
          }
          fillRect(c, 290, 230, 190, 110, colors.redLight);
          strokeRect(c, 290, 230, 190, 110, 6, colors.navy);
          fillCircle(c, 580, 285, 66, colors.teal);
          ring(c, 580, 285, 66, 6, colors.navy);
          triangle(c, 700, 470, 60, 0, colors.blue);
          triangle(c, 150, 470, 60, 180, colors.teal);
        }
      }
    ]
  },
  {
    packageDir: "kelas2-matematika-b07-waktu-uang",
    base: "aktivitas-waktu-uang",
    summaryAlt: "Lima ilustrasi waktu dan uang: jam dengan enam puluh tanda menit, bumi siang malam dikelilingi dua puluh empat titik, uang kertas dan koin, tiga kartu rangkuman, serta jam, koin, dan uang.",
    steps: [
      {
        alt: "Jam dinding dengan enam puluh tanda menit di sekelilingnya dan satu lingkaran penuh ditandai teal.",
        draw(c) {
          clockFace(c, 400, 290, 150, 3, 0);
          for (let i = 0; i < 60; i += 1) {
            const angle = ((i * 6) * Math.PI) / 180;
            const length = i % 5 === 0 ? 22 : 12;
            strokeLine(
              c,
              400 + Math.cos(angle) * 172,
              290 + Math.sin(angle) * 172,
              400 + Math.cos(angle) * (172 + length),
              290 + Math.sin(angle) * (172 + length),
              i % 5 === 0 ? 4 : 2,
              i % 5 === 0 ? colors.teal : colors.navy
            );
          }
        }
      },
      {
        alt: "Bumi dengan sisi siang dan malam, dikelilingi dua puluh empat titik sebagai jam dalam sehari.",
        draw(c) {
          dayNight(c, 400, 300, 140);
          ringDots(c, 400, 300, 210, 24, colors.blue, 9);
        }
      },
      {
        alt: "Uang kertas di tengah, satu koin emas besar, dan satu koin kecil.",
        draw(c) {
          note(c, 300, 230, 320, 140);
          coin(c, 160, 470, 56, colors.sun);
          coin(c, 660, 470, 44, colors.pale);
        }
      },
      {
        alt: "Tiga kartu rangkuman: jam, uang kertas dengan koin, dan bumi siang malam.",
        draw(c) {
          summaryTrio(c, [
            (h, cx, cy) => miniClock(h, cx, cy, 3, 0),
            (h, cx, cy) => miniMoney(h, cx, cy),
            (h, cx, cy) => dayNight(h, cx, cy, 52)
          ]);
        }
      },
      {
        alt: "Jam dinding, dua koin, dan satu lembar uang kertas.",
        draw(c) {
          clockFace(c, 210, 240, 120, 9, 0);
          strokeLine(c, 60, 420, 740, 420, 3, colors.muted);
          coin(c, 180, 500, 46, colors.sun);
          coin(c, 300, 500, 46, colors.pale);
          note(c, 400, 456, 300, 88);
        }
      }
    ]
  },
  {
    packageDir: "kelas2-matematika-b08-data",
    base: "aktivitas-data",
    summaryAlt: "Lima ilustrasi penyajian data: tabel berisi keterangan dan titik jumlah, diagram batang empat batang, diagram batang dengan batang tertinggi ditandai, tiga kartu rangkuman, dan perbandingan dua batang.",
    steps: [
      {
        alt: "Tabel tiga kolom tiga baris dengan baris judul berwarna dan titik-titik jumlah pada dua baris berikutnya.",
        draw(c) {
          tableGrid(c, 100, 130, 600, 330, 3, 3);
          dotCell(c, 433, 240, 4);
          dotCell(c, 633, 240, 6);
          dotCell(c, 433, 350, 3);
          dotCell(c, 633, 350, 5);
        }
      },
      {
        alt: "Diagram batang empat batang berbeda tinggi dengan sumbu mendatar dan tegak.",
        draw(c) {
          barChart(c, 120, 100, 560, 380, [4, 6, 3, 8]);
        }
      },
      {
        alt: "Diagram batang dengan batang tertinggi berwarna oranye dan kaca pembesar di atasnya.",
        draw(c) {
          barChart(c, 120, 100, 560, 380, [4, 6, 3, 8], { highlight: 3 });
          fillCircle(c, 610, 100, 48, colors.sky);
          ring(c, 610, 100, 48, 10, colors.navy);
          strokeLine(c, 644, 134, 682, 172, 16, colors.teal);
        }
      },
      {
        alt: "Tiga kartu rangkuman: tabel, diagram batang tiga batang, dan diagram batang dengan batang tertinggi ditandai.",
        draw(c) {
          summaryTrio(c, [
            (h, cx, cy) => miniTable(h, cx, cy),
            (h, cx, cy) => miniBarChart(h, cx, cy, [4, 6, 3]),
            (h, cx, cy) => miniBarChart(h, cx, cy, [3, 7, 4], 1)
          ]);
        }
      },
      {
        alt: "Diagram batang empat batang dengan dua batang berbeda tinggi dihubungkan garis putus-putus sebagai perbandingan.",
        draw(c) {
          barChart(c, 120, 100, 560, 380, [4, 9, 6, 3]);
          const base = 480;
          const slot = 560 / 4;
          const shortTop = base - (380 * 0.84 * 4) / 9;
          const tallTop = base - 380 * 0.84;
          const shortX = 120 + slot * 0 + slot / 2;
          const tallX = 120 + slot * 1 + slot / 2;
          dashedLine(c, shortX, shortTop, tallX, shortTop, 4, colors.orange);
          dashedLine(c, tallX, shortTop, tallX, tallTop, 4, colors.orange);
          chevron(c, tallX + 30, (shortTop + tallTop) / 2, 14, 1, colors.orange, 7);
        }
      }
    ]
  }
];

function circlePanelGrid(c, cx, cy) {
  dotArray(c, cx - 90, cy - 56, 3, 2, 80, 18, colors.teal);
}

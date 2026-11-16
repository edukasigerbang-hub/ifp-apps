import {
  arrow,
  checkMark,
  colors,
  dashedLine,
  equalsSign,
  fillCircle,
  fillPolygon,
  fillRect,
  fillRoundRect,
  plusSign,
  ring,
  star,
  strokeLine,
  strokeRect,
  strokeRoundRect,
  triangle
} from "../illustrationKit.mjs";
import {
  chevron,
  coin,
  curveArrow,
  cylinder3d,
  dashedBox,
  diceFace,
  dotRow,
  flowStep,
  fractionBar,
  magnifier,
  miniBarChart,
  miniCircle,
  miniCoins,
  miniCylinder,
  miniDice,
  miniDotRows,
  miniDots,
  miniFlow,
  miniFrame,
  miniGrid,
  miniNumberLine,
  miniPyramid,
  miniScale,
  miniSixRing,
  numberLine,
  operationTile,
  panel,
  pie,
  pyramid3d,
  summaryTrio,
  towerRow
} from "../activityScenes.mjs";

const LINE_TICKS = 14;
const LINE_STEP = 640 / LINE_TICKS;

function lineX(index) {
  return 80 + LINE_STEP * index;
}

function storyCard(c, x, y, width, height) {
  fillRoundRect(c, x, y, width, height, 14, colors.white);
  strokeRoundRect(c, x, y, width, height, 14, 5, colors.navy);
  dashedLine(c, x + 26, y + 40, x + width - 26, y + 40, 4, colors.muted, 12, 9);
  dashedLine(c, x + 26, y + 88, x + width - 26, y + 88, 4, colors.muted, 12, 9);
  dashedLine(c, x + 26, y + 136, x + width * 0.6, y + 136, 4, colors.muted, 12, 9);
}

function hundredGrid(c, x, y, cell, filled) {
  for (let row = 0; row < 10; row += 1) {
    for (let column = 0; column < 10; column += 1) {
      const index = row * 10 + column;
      fillRect(c, x + column * cell, y + row * cell, cell, cell, index < filled ? colors.green : colors.pale);
    }
  }
  strokeRect(c, x, y, cell * 10, cell * 10, 4, colors.navy);
  for (let i = 1; i < 10; i += 1) {
    strokeLine(c, x + i * cell, y, x + i * cell, y + cell * 10, 1, colors.navy);
    strokeLine(c, x, y + i * cell, x + cell * 10, y + i * cell, 1, colors.navy);
  }
}

function prismSolid(c, front, offset, faceFill, edgeColor, widths = [5, 7]) {
  const [thin, thick] = widths;
  const back = front.map(([x, y]) => [x + offset[0], y + offset[1]]);
  fillPolygon(c, back, faceFill);
  for (let i = 0; i < 3; i += 1) {
    strokeLine(c, back[i][0], back[i][1], back[(i + 1) % 3][0], back[(i + 1) % 3][1], thin, edgeColor);
  }
  const visible = [];
  for (let i = 0; i < 3; i += 1) {
    const a = front[i];
    const b = front[(i + 1) % 3];
    const nx = a[1] - b[1];
    const ny = b[0] - a[0];
    if (nx * offset[0] + ny * offset[1] > 0) visible.push(i);
  }
  for (const i of visible) {
    const a = front[i];
    const b = front[(i + 1) % 3];
    const a2 = [a[0] + offset[0], a[1] + offset[1]];
    const b2 = [b[0] + offset[0], b[1] + offset[1]];
    fillPolygon(c, [a, b, b2, a2], faceFill);
    strokeLine(a[0], a[1], a2[0], a2[1], thin, edgeColor);
    strokeLine(b[0], b[1], b2[0], b2[1], thin, edgeColor);
    strokeLine(a2[0], a2[1], b2[0], b2[1], thin, edgeColor);
  }
  for (let i = 0; i < 3; i += 1) {
    if (visible.includes(i) || visible.includes((i + 2) % 3)) continue;
    dashedLine(c, front[i][0], front[i][1], back[i][0], back[i][1], 3, colors.gray, 10, 8);
  }
  fillPolygon(c, front, faceFill);
  for (let i = 0; i < 3; i += 1) {
    strokeLine(c, front[i][0], front[i][1], front[(i + 1) % 3][0], front[(i + 1) % 3][1], thick, edgeColor);
  }
}

function ratioBars(c, cx, cy) {
  fillRect(c, cx - 88, cy - 26, 120, 26, colors.redLight);
  strokeRect(c, cx - 88, cy - 26, 120, 26, 3, colors.navy);
  fillRect(c, cx - 88, cy + 12, 90, 26, colors.blueLight);
  strokeRect(c, cx - 88, cy + 12, 90, 26, 3, colors.navy);
}

export const PLAN = [
  {
    packageDir: "kelas6-matematika-b01-bilangan-bulat",
    base: "aktivitas-bilangan-bulat",
    summaryAlt: "Lima ilustrasi bilangan bulat: garis bilangan dengan daerah negatif dan positif, dua penanda pembanding, tiga panah langkah penjumlahan, tampilan lengkap garis bilangan, dan tiga kartu rangkuman.",
    steps: [
      {
        alt: "Garis bilangan dengan daerah kiri berwarna merah muda untuk bilangan negatif, daerah kanan berwarna hijau muda untuk bilangan positif, dan titik nol ditandai lebih besar.",
        draw(c) {
          fillRect(c, 76, 232, 324, 136, colors.redLight);
          fillRect(c, 400, 232, 324, 136, colors.tealLight);
          numberLine(c, 80, 300, 640, LINE_TICKS);
          for (let i = 0; i <= LINE_TICKS; i += 1) {
            fillCircle(c, lineX(i), 300, i === 7 ? 14 : 10, i < 7 ? colors.red : i === 7 ? colors.navy : colors.teal);
          }
          dashedLine(c, 400, 176, 400, 250, 5, colors.navy, 12, 9);
        }
      },
      {
        alt: "Garis bilangan dengan titik merah di posisi minus tiga, titik teal di posisi dua, dan panah oranye di atasnya menunjuk ke kiri menuju bilangan yang lebih kecil.",
        draw(c) {
          numberLine(c, 80, 320, 640, LINE_TICKS);
          fillCircle(c, lineX(4), 320, 18, colors.red);
          ring(c, lineX(4), 320, 30, 5, colors.navy);
          fillCircle(c, lineX(9), 320, 18, colors.teal);
          ring(c, lineX(9), 320, 30, 5, colors.navy);
          dashedLine(c, lineX(4), 214, lineX(9), 214, 4, colors.orange, 12, 9);
          chevron(c, lineX(4) + 54, 214, 18, -1, colors.orange, 8);
          dashedLine(c, lineX(4), 350, lineX(4), 430, 4, colors.muted, 10, 8);
          dashedLine(c, lineX(9), 350, lineX(9), 430, 4, colors.muted, 10, 8);
          fillCircle(c, lineX(4), 480, 34, colors.redLight);
          ring(c, lineX(4), 480, 34, 5, colors.navy);
          fillCircle(c, lineX(9), 480, 34, colors.tealLight);
          ring(c, lineX(9), 480, 34, 5, colors.navy);
        }
      },
      {
        alt: "Garis bilangan dengan titik biru di posisi minus lima, tiga panah melengkung berurutan ke kanan, dan titik oranye di posisi minus dua.",
        draw(c) {
          numberLine(c, 80, 400, 640, LINE_TICKS);
          for (let i = 2; i < 5; i += 1) {
            curveArrow(c, lineX(i), 386, lineX(i + 1), 386, 78, 5, colors.blue);
          }
          fillCircle(c, lineX(2), 400, 18, colors.blue);
          ring(c, lineX(2), 400, 30, 5, colors.navy);
          fillCircle(c, lineX(5), 400, 18, colors.orange);
          ring(c, lineX(5), 400, 30, 5, colors.navy);
          for (let i = 3; i < 5; i += 1) fillCircle(c, lineX(i), 400, 9, colors.teal);
        }
      },
      {
        alt: "Garis bilangan dengan titik nol di tengah, bagian kiri bertanda negatif, panah melengkung tiga langkah ke kanan, dan dua penanda untuk membandingkan posisi.",
        draw(c) {
          numberLine(c, 80, 300, 640, LINE_TICKS);
          fillCircle(c, 400 - (640 * 3) / 14, 300, 11, colors.red);
          fillCircle(c, 400 + (640 * 1) / 14, 300, 11, colors.teal);
          curveArrow(c, 400 - (640 * 5) / 14, 280, 400 - (640 * 2) / 14, 280, 60, 6, colors.blue);
          strokeLine(c, 60, 420, 740, 420, 3, colors.muted);
          strokeLine(c, 100, 500, 700, 500, 4, colors.muted);
          fillCircle(c, 240, 500, 26, colors.redLight);
          ring(c, 240, 500, 26, 4, colors.navy);
          fillCircle(c, 560, 500, 26, colors.greenLight);
          ring(c, 560, 500, 26, 4, colors.navy);
          chevron(c, 400, 500, 22, -1, colors.navy, 9);
        }
      },
      {
        alt: "Tiga kartu rangkuman: garis bilangan bertitik, neraca pembanding, dan tiga langkah berjajar.",
        draw(c) {
          summaryTrio(c, [
            (h, cx, cy) =>
              miniNumberLine(h, cx, cy, [
                [2, colors.red],
                [6, colors.navy],
                [9, colors.teal]
              ]),
            (h, cx, cy) => miniScale(h, cx, cy),
            (h, cx, cy) => miniFlow(h, cx, cy, 3)
          ]);
        }
      }
    ]
  },
  {
    packageDir: "kelas6-matematika-b02-pecahan-desimal",
    base: "aktivitas-pecahan-desimal",
    summaryAlt: "Lima ilustrasi pecahan dan desimal: setengah pada batang sepuluh, seperempat pada lingkaran dan kotak, penjumlahan tiga kotak seratus, tiga kartu rangkuman, dan batang sepuluh serta kotak seratus.",
    steps: [
      {
        alt: "Batang terbagi sepuluh dengan lima bagian diwarnai, batang terbagi dua dengan satu bagian diwarnai, dan garis putus-putus oranye di titik tengah keduanya.",
        draw(c) {
          fractionBar(c, 80, 160, 640, 92, 10, 5, colors.teal);
          fractionBar(c, 80, 340, 640, 92, 2, 1, colors.blue);
          dashedLine(c, 400, 130, 400, 470, 5, colors.orange, 12, 9);
        }
      },
      {
        alt: "Lingkaran terbagi empat dengan satu bagian diwarnai biru dan kotak terbagi empat dengan satu kotak diwarnai biru.",
        draw(c) {
          pie(c, 268, 300, 160, 4, 1, colors.blue);
          fillRect(c, 500, 200, 200, 200, colors.blueLight);
          fillRect(c, 500, 200, 100, 100, colors.blue);
          strokeRect(c, 500, 200, 200, 200, 5, colors.navy);
          strokeLine(c, 500, 300, 700, 300, 4, colors.navy);
          strokeLine(c, 600, 200, 600, 400, 4, colors.navy);
        }
      },
      {
        alt: "Tiga kotak seratus berjajar; kotak pertama lima puluh sel diwarnai, kotak kedua dua puluh lima sel, dan kotak ketiga tujuh puluh lima sel, dihubungkan tanda tambah dan sama dengan.",
        draw(c) {
          hundredGrid(c, 95, 225, 15, 50);
          hundredGrid(c, 325, 225, 15, 25);
          hundredGrid(c, 555, 225, 15, 75);
          plusSign(c, 285, 300, 13, 5, colors.navy);
          equalsSign(c, 515, 300, 13, 5, colors.navy);
        }
      },
      {
        alt: "Tiga kartu rangkuman: kotak seratus dengan dua puluh lima sel, kerangka sepuluh berisi lima, dan garis bilangan bertitik.",
        draw(c) {
          summaryTrio(c, [
            (h, cx, cy) => miniGrid(h, cx, cy, 10, 10, 25),
            (h, cx, cy) => miniFrame(h, cx, cy, 5),
            (h, cx, cy) =>
              miniNumberLine(h, cx, cy, [
                [2, colors.teal],
                [5, colors.orange],
                [8, colors.blue]
              ])
          ]);
        }
      },
      {
        alt: "Batang terbagi sepuluh dengan lima bagian diwarnai, batang terbagi empat dengan satu bagian diwarnai, dan kotak seratus dengan dua puluh lima kotak diwarnai.",
        draw(c) {
          fractionBar(c, 80, 120, 640, 70, 10, 5);
          fractionBar(c, 80, 250, 640, 70, 4, 1, colors.blue);
          for (let row = 0; row < 10; row += 1) {
            for (let column = 0; column < 10; column += 1) {
              const filled = row < 5 && column < 5;
              fillRect(c, 240 + column * 32, 370 + row * 20, 32, 20, filled ? colors.green : colors.pale);
            }
          }
          strokeRect(c, 240, 370, 320, 200, 4, colors.navy);
          for (let i = 1; i < 10; i += 1) {
            strokeLine(c, 240 + i * 32, 370, 240 + i * 32, 570, 1, colors.navy);
            strokeLine(c, 240, 370 + i * 20, 560, 370 + i * 20, 1, colors.navy);
          }
        }
      }
    ]
  },
  {
    packageDir: "kelas6-matematika-b03-rasio-proporsi",
    base: "aktivitas-rasio-proporsi",
    summaryAlt: "Lima ilustrasi rasio dan proporsi: empat titik merah dan tiga titik biru, batang delapan banding enam menjadi empat banding tiga, dua panel rasio senilai, tiga kartu rangkuman, dan batang enam banding sembilan menjadi dua banding tiga.",
    steps: [
      {
        alt: "Baris empat titik merah dan baris tiga titik biru yang masing-masing dibingkai garis putus-putus, dengan dua titik navy sebagai tanda banding.",
        draw(c) {
          dotRow(c, 180, 166, 4, 90, 30, colors.red);
          dotRow(c, 180, 302, 3, 90, 30, colors.blue);
          dashedBox(c, 130, 112, 362, 108, colors.muted);
          dashedBox(c, 130, 248, 272, 108, colors.muted);
          fillCircle(c, 580, 208, 13, colors.navy);
          fillCircle(c, 580, 260, 13, colors.navy);
        }
      },
      {
        alt: "Batang delapan bagian merah dan enam bagian biru di atas, panah ke bawah, lalu batang empat bagian merah dan tiga bagian biru, dengan garis putus-putus oranye membagi kelompok dua bagian.",
        draw(c) {
          fillRect(c, 100, 190, 400, 54, colors.redLight);
          strokeRect(c, 100, 190, 400, 54, 4, colors.navy);
          fillRect(c, 100, 262, 300, 54, colors.blueLight);
          strokeRect(c, 100, 262, 300, 54, 4, colors.navy);
          dashedLine(c, 200, 170, 200, 244, 4, colors.orange, 10, 8);
          dashedLine(c, 300, 170, 300, 244, 4, colors.orange, 10, 8);
          dashedLine(c, 200, 262, 200, 336, 4, colors.orange, 10, 8);
          arrow(c, 400, 342, 400, 386, 6, colors.navy);
          fillRect(c, 100, 404, 200, 48, colors.redLight);
          strokeRect(c, 100, 404, 200, 48, 4, colors.navy);
          fillRect(c, 100, 466, 150, 48, colors.blueLight);
          strokeRect(c, 100, 466, 150, 48, 4, colors.navy);
        }
      },
      {
        alt: "Panel kiri dua titik merah dan tiga titik biru, tanda sama dengan di tengah, panel kanan empat titik merah dan enam titik biru.",
        draw(c) {
          panel(c, 50, 130, 310, 340, (h, cx, cy) => {
            fillCircle(h, cx - 52, cy - 46, 18, colors.red);
            fillCircle(h, cx - 52, cy + 46, 18, colors.red);
            fillCircle(h, cx + 52, cy - 54, 18, colors.blue);
            fillCircle(h, cx + 52, cy, 18, colors.blue);
            fillCircle(h, cx + 52, cy + 54, 18, colors.blue);
          });
          panel(c, 440, 130, 310, 340, (h, cx, cy) => {
            [-72, -24, 24, 72].forEach((dy) => fillCircle(h, cx - 56, cy + dy, 15, colors.red));
            for (let i = 0; i < 6; i += 1) fillCircle(h, cx + 56, cy - 75 + i * 30, 12, colors.blue);
          });
          equalsSign(c, 400, 300, 14, 6, colors.navy);
        }
      },
      {
        alt: "Tiga kartu rangkuman: empat titik merah, tiga titik biru, dan sepasang batang empat banding tiga.",
        draw(c) {
          summaryTrio(c, [
            (h, cx, cy) => miniDots(h, cx, cy, 4, colors.red),
            (h, cx, cy) => miniDots(h, cx, cy, 3, colors.blue),
            (h, cx, cy) => ratioBars(h, cx, cy)
          ]);
        }
      },
      {
        alt: "Batang enam bagian merah dan sembilan bagian biru di atas, panah ke bawah, lalu batang dua bagian merah dan tiga bagian biru; garis putus-putus oranye membagi tiga bagian.",
        draw(c) {
          fillRect(c, 100, 150, 312, 50, colors.redLight);
          strokeRect(c, 100, 150, 312, 50, 4, colors.navy);
          fillRect(c, 100, 216, 468, 50, colors.blueLight);
          strokeRect(c, 100, 216, 468, 50, 4, colors.navy);
          dashedLine(c, 256, 134, 256, 280, 4, colors.orange, 10, 8);
          dashedLine(c, 412, 134, 412, 280, 4, colors.orange, 10, 8);
          arrow(c, 400, 292, 400, 336, 6, colors.navy);
          fillRect(c, 100, 354, 104, 46, colors.redLight);
          strokeRect(c, 100, 354, 104, 46, 4, colors.navy);
          fillRect(c, 100, 414, 156, 46, colors.blueLight);
          strokeRect(c, 100, 414, 156, 46, 4, colors.navy);
        }
      }
    ]
  },
  {
    packageDir: "kelas6-matematika-b04-lingkaran",
    base: "aktivitas-lingkaran",
    summaryAlt: "Lima ilustrasi lingkaran: jari-jari dari pusat ke tepi, diameter dan dua jari-jari, keliling ditelusuri panah, tiga kartu rangkuman, dan lingkaran dengan jari-jari serta diameter.",
    steps: [
      {
        alt: "Lingkaran dengan titik pusat dan satu garis teal lurus dari pusat ke tepi kanan sebagai jari-jari.",
        draw(c) {
          fillCircle(c, 400, 300, 190, colors.pale);
          ring(c, 400, 300, 190, 8, colors.navy);
          strokeLine(c, 400, 300, 590, 300, 8, colors.teal);
          fillCircle(c, 400, 300, 14, colors.navy);
          fillCircle(c, 590, 300, 11, colors.teal);
        }
      },
      {
        alt: "Lingkaran dengan garis biru menembus pusat dari tepi ke tepi sebagai diameter, satu jari-jari teal ke arah kanan atas, dan dua titik teal di tengah tiap separuh diameter.",
        draw(c) {
          fillCircle(c, 400, 300, 190, colors.pale);
          ring(c, 400, 300, 190, 8, colors.navy);
          strokeLine(c, 210, 300, 590, 300, 8, colors.blue);
          strokeLine(c, 400, 300, 400 + 190 * Math.cos(-Math.PI / 4), 300 + 190 * Math.sin(-Math.PI / 4), 7, colors.teal);
          fillCircle(c, 400, 300, 14, colors.navy);
          fillCircle(c, 305, 300, 11, colors.teal);
          fillCircle(c, 495, 300, 11, colors.teal);
        }
      },
      {
        alt: "Lingkaran dengan tepi tebal sebagai keliling, panah biru melengkung menelusuri bagian atas, dan satu garis oranye dari pusat ke tepi sebagai jari-jari.",
        draw(c) {
          fillCircle(c, 400, 300, 164, colors.pale);
          ring(c, 400, 300, 172, 16, colors.tealLight);
          ring(c, 400, 300, 182, 6, colors.navy);
          ring(c, 400, 300, 162, 6, colors.navy);
          curveArrow(c, 260, 200, 540, 200, 70, 6, colors.blue);
          strokeLine(c, 400, 300, 564, 300, 7, colors.orange);
          fillCircle(c, 400, 300, 13, colors.navy);
        }
      },
      {
        alt: "Tiga kartu rangkuman: lingkaran dengan jari-jari, lingkaran dengan diameter, dan lingkaran dengan tepi tebal.",
        draw(c) {
          summaryTrio(c, [
            (h, cx, cy) => miniCircle(h, cx, cy, "radius"),
            (h, cx, cy) => miniCircle(h, cx, cy, "diameter"),
            (h, cx, cy) => miniCircle(h, cx, cy, "keliling")
          ]);
        }
      },
      {
        alt: "Lingkaran dengan titik pusat, satu garis jari-jari berwarna teal dari pusat ke tepi, dan satu garis diameter berwarna biru menembus pusat.",
        draw(c) {
          fillCircle(c, 400, 300, 200, colors.pale);
          ring(c, 400, 300, 200, 7, colors.navy);
          strokeLine(c, 400, 300, 400 + 200 * Math.cos(-Math.PI / 6), 300 + 200 * Math.sin(-Math.PI / 6), 6, colors.teal);
          strokeLine(c, 400 - 200 * Math.cos(Math.PI / 7), 300 - 200 * Math.sin(Math.PI / 7), 400 + 200 * Math.cos(Math.PI / 7), 300 + 200 * Math.sin(Math.PI / 7), 6, colors.blue);
          fillCircle(c, 400, 300, 12, colors.navy);
        }
      }
    ]
  },
  {
    packageDir: "kelas6-matematika-b05-bangun-ruang",
    base: "aktivitas-bangun-ruang-kelas6",
    summaryAlt: "Lima ilustrasi bangun ruang: prisma dengan dua sisi sejajar disorot, limas dengan titik puncak, tabung dengan jari-jari dan tinggi, tiga kartu rangkuman, dan prisma, limas, serta tabung.",
    steps: [
      {
        alt: "Prisma segitiga tiga dimensi dengan dua sisi segitiga sejajar di depan dan belakang diwarnai oranye.",
        draw(c) {
          prismSolid(c, [[230, 380], [470, 380], [350, 100]], [110, 86], colors.orangeLight, colors.orange);
          for (const [x, y] of [[230, 380], [470, 380], [350, 100], [460, 186], [340, 466], [580, 466]]) {
            fillCircle(c, x, y, 9, colors.orange);
          }
        }
      },
      {
        alt: "Limas tiga dimensi dengan titik puncak ditandai oranye dan garis putus-putus dari puncak ke alas.",
        draw(c) {
          pyramid3d(c, 400, 150, 450, 160);
          fillCircle(c, 400, 150, 16, colors.orange);
          ring(c, 400, 150, 26, 5, colors.navy);
          dashedLine(c, 400, 176, 400, 450, 4, colors.orange, 12, 9);
        }
      },
      {
        alt: "Tabung tiga dimensi dengan garis oranye dari pusat tutup ke tepi sebagai jari-jari dan garis putus-putus oranye dari tutup ke alas sebagai tinggi.",
        draw(c) {
          cylinder3d(c, 400, 150, 470, 150);
          strokeLine(c, 400, 150, 550, 150, 7, colors.orange);
          fillCircle(c, 400, 150, 13, colors.navy);
          dashedLine(c, 400, 176, 400, 444, 5, colors.orange, 12, 9);
        }
      },
      {
        alt: "Tiga kartu rangkuman: prisma segitiga, limas, dan tabung.",
        draw(c) {
          summaryTrio(c, [
            (h, cx, cy) => prismSolid(h, [[cx - 54, cy + 42], [cx + 54, cy + 42], [cx, cy - 38]], [34, 26], colors.orangeLight, colors.orange, [3, 5]),
            (h, cx, cy) => miniPyramid(h, cx, cy),
            (h, cx, cy) => miniCylinder(h, cx, cy)
          ]);
        }
      },
      {
        alt: "Prisma segitiga, limas, dan tabung digambar tiga dimensi.",
        draw(c) {
          prismSolid(c, [[80, 300], [200, 300], [140, 190]], [40, 30], colors.tealLight, colors.navy);
          pyramid3d(c, 470, 140, 400, 110);
          cylinder3d(c, 690, 170, 400, 62);
        }
      }
    ]
  },
  {
    packageDir: "kelas6-matematika-b06-statistika",
    base: "aktivitas-statistika",
    summaryAlt: "Lima ilustrasi statistika: menara data dengan garis rata-rata, kolom data dengan nilai tengah disorot, baris titik dengan data tersering dibingkai, tiga kartu rangkuman, dan kolom titik dengan panah penyeimbang.",
    steps: [
      {
        alt: "Tiga menara balok bertingkat enam, delapan, dan sepuluh, garis putus-putus oranye pada tingkat delapan, serta dua segitiga oranye menunjuk arah penyeimbangan.",
        draw(c) {
          towerRow(c, 306, 500, [6, 8, 10], colors.blue, 32, 46);
          dashedLine(c, 280, 500 - 8 * 32, 520, 500 - 8 * 32, 5, colors.orange, 12, 9);
          triangle(c, 482, 152, 15, 180, colors.orange, 3);
          triangle(c, 322, 284, 15, 0, colors.orange, 3);
        }
      },
      {
        alt: "Lima kolom titik bertingkat empat sampai delapan, kolom tengah berwarna oranye, dan garis putus-putus oranye pada ketinggian kolom tengah.",
        draw(c) {
          const counts = [4, 5, 6, 7, 8];
          strokeLine(c, 60, 540, 740, 540, 5, colors.navy);
          counts.forEach((count, index) => {
            const cx = 160 + index * 120;
            for (let i = 0; i < count; i += 1) {
              fillCircle(c, cx, 516 - i * 40, 15, index === 2 ? colors.orange : colors.blue);
            }
          });
          dashedLine(c, 100, 316, 700, 316, 5, colors.orange, 12, 9);
          triangle(c, 400, 278, 15, 180, colors.orange, 3);
        }
      },
      {
        alt: "Empat baris titik berisi tiga, enam, empat, dan dua titik; baris dengan enam titik berwarna teal dan dibingkai garis putus-putus oranye.",
        draw(c) {
          const rows = [3, 6, 4, 2];
          rows.forEach((count, index) => {
            dotRow(c, 200, 160 + index * 96, count, 56, 20, index === 1 ? colors.teal : colors.blue);
          });
          dashedBox(c, 162, 208, 356, 96, colors.orange);
        }
      },
      {
        alt: "Tiga kartu rangkuman: diagram batang dengan garis rata-rata, diagram batang dengan batang tertinggi disorot, dan baris titik.",
        draw(c) {
          summaryTrio(c, [
            (h, cx, cy) => miniBarChart(h, cx, cy, [3, 5, 4], -1, 4),
            (h, cx, cy) => miniBarChart(h, cx, cy, [4, 9, 6, 3], 1),
            (h, cx, cy) => miniDotRows(h, cx, cy, [4, 6, 3])
          ]);
        }
      },
      {
        alt: "Tiga kolom titik bertingkat tujuh, delapan, dan sembilan, garis putus-putus oranye pada tingkat delapan, dan panah melengkung dari kolom tertinggi ke kolom terendah.",
        draw(c) {
          const counts = [7, 8, 9];
          strokeLine(c, 60, 540, 740, 540, 5, colors.navy);
          counts.forEach((count, index) => {
            const cx = 260 + index * 140;
            for (let i = 0; i < count; i += 1) {
              fillCircle(c, cx, 520 - i * 42, 15, index === 1 ? colors.teal : colors.blue);
            }
          });
          dashedLine(c, 150, 520 - 8 * 42, 650, 520 - 8 * 42, 5, colors.orange, 12, 9);
          curveArrow(c, 540, 160, 260, 160, 60, 6, colors.teal);
        }
      }
    ]
  },
  {
    packageDir: "kelas6-matematika-b07-peluang",
    base: "aktivitas-peluang",
    summaryAlt: "Lima ilustrasi peluang: enam sisi dadu, satu dari enam bagian lingkaran dengan dadu bermata tiga, dua sisi koin, tiga kartu rangkuman, dan dadu, koin, serta enam titik hasil.",
    steps: [
      {
        alt: "Enam dadu berjajar dua baris dengan mata satu sampai enam.",
        draw(c) {
          const pips = [1, 2, 3, 4, 5, 6];
          pips.forEach((pipsShown, index) => {
            diceFace(c, 160 + (index % 3) * 175, 110 + Math.floor(index / 3) * 200, 130, pipsShown);
          });
        }
      },
      {
        alt: "Lingkaran terbagi enam dengan satu bagian diwarnai teal, dadu bermata tiga di sebelah kanan, dan panah oranye menunjuk ke lingkaran.",
        draw(c) {
          pie(c, 268, 300, 168, 6, 1, colors.teal);
          diceFace(c, 500, 216, 168, 3);
          chevron(c, 466, 300, 18, -1, colors.orange, 8);
        }
      },
      {
        alt: "Dua koin besar bersebelahan, kiri bergambar bintang dan kanan bergambar lingkaran, dipisahkan garis putus-putus.",
        draw(c) {
          coin(c, 260, 300, 120, colors.sun);
          star(c, 260, 300, 54, colors.navy);
          coin(c, 560, 300, 100, colors.pale);
          ring(c, 560, 300, 48, 5, colors.navy);
          dashedLine(c, 400, 130, 400, 470, 5, colors.muted, 12, 10);
        }
      },
      {
        alt: "Tiga kartu rangkuman: dadu bermata tiga, dua sisi koin, dan lingkaran berisi enam titik.",
        draw(c) {
          summaryTrio(c, [
            (h, cx, cy) => miniDice(h, cx, cy),
            (h, cx, cy) => miniCoins(h, cx, cy),
            (h, cx, cy) => miniSixRing(h, cx, cy)
          ]);
        }
      },
      {
        alt: "Dadu dengan tiga mata dadu, dua sisi koin, dan enam titik hasil yang mungkin.",
        draw(c) {
          fillRect(c, 100, 150, 220, 220, colors.white);
          strokeRect(c, 100, 150, 220, 220, 7, colors.navy);
          for (const [dx, dy] of [
            [150, 200],
            [210, 260],
            [270, 320]
          ]) {
            fillCircle(c, dx, dy, 20, colors.navy);
          }
          coin(c, 500, 230, 90, colors.sun);
          star(c, 500, 230, 40, colors.navy);
          coin(c, 660, 230, 70, colors.pale);
          ring(c, 660, 230, 34, 4, colors.navy);
          strokeLine(c, 60, 420, 740, 420, 3, colors.muted);
          for (let i = 0; i < 6; i += 1) fillCircle(c, 160 + i * 96, 500, 24, i % 2 === 0 ? colors.teal : colors.blue);
        }
      }
    ]
  },
  {
    packageDir: "kelas6-matematika-b08-pemecahan-masalah",
    base: "aktivitas-pemecahan-masalah-kelas6",
    summaryAlt: "Lima ilustrasi pemecahan masalah: kartu soal dengan kaca pembesar, empat pilihan operasi, tanda centang dengan panah kembali, empat langkah dengan langkah pertama disorot, dan alur empat langkah lengkap.",
    steps: [
      {
        alt: "Kartu soal bergaris dengan kaca pembesar di atasnya dan satu langkah oranye di bawahnya sebagai langkah pertama.",
        draw(c) {
          storyCard(c, 120, 140, 440, 210);
          magnifier(c, 640, 250, 74);
          flowStep(c, 400, 466, 54, 1, true);
        }
      },
      {
        alt: "Empat kotak operasi hitung tersusun dua baris, kotak tambah di kiri atas ditandai lingkaran oranye.",
        draw(c) {
          const ops = ["plus", "minus", "times", "divide"];
          ops.forEach((op, index) => {
            const cx = 260 + (index % 2) * 280;
            const cy = 190 + Math.floor(index / 2) * 220;
            operationTile(c, cx, cy, 150, op);
          });
          ring(c, 260, 190, 100, 7, colors.orange);
        }
      },
      {
        alt: "Kartu soal di kiri, kotak jawaban bertanda centang hijau di kanan, dan panah melengkung kembali ke kartu soal.",
        draw(c) {
          storyCard(c, 110, 120, 330, 180);
          fillRoundRect(c, 520, 120, 210, 180, 18, colors.pale);
          strokeRoundRect(c, 520, 120, 210, 180, 18, 4, colors.navy);
          checkMark(c, 560, 165, 120, 14, colors.green);
          curveArrow(c, 600, 380, 300, 380, 90, 6, colors.teal);
        }
      },
      {
        alt: "Empat langkah berjajar dengan panah maju; langkah pertama berwarna oranye dan diperbesar oleh kaca pembesar.",
        draw(c) {
          flowStep(c, 130, 230, 58, 1, true);
          flowStep(c, 300, 230, 58, 2);
          flowStep(c, 470, 230, 58, 3);
          flowStep(c, 640, 230, 58, 4);
          arrow(c, 192, 230, 238, 230, 6, colors.navy);
          arrow(c, 362, 230, 408, 230, 6, colors.navy);
          arrow(c, 532, 230, 578, 230, 6, colors.navy);
          strokeLine(c, 60, 330, 740, 330, 3, colors.muted);
          magnifier(c, 130, 440, 62);
        }
      },
      {
        alt: "Empat langkah penyelesaian berjajar dengan panah maju, satu panah kembali ke langkah pertama, dan tanda centang di langkah terakhir.",
        draw(c) {
          flowStep(c, 120, 220, 58, 1);
          flowStep(c, 300, 220, 58, 2);
          flowStep(c, 480, 220, 58, 3);
          flowStep(c, 640, 220, 58, 4);
          arrow(c, 184, 220, 238, 220, 6, colors.navy);
          arrow(c, 364, 220, 418, 220, 6, colors.navy);
          arrow(c, 544, 220, 578, 220, 6, colors.navy);
          curveArrow(c, 640, 290, 120, 290, 90, 5, colors.teal);
          checkMark(c, 620, 340, 44, 8, colors.green);
          strokeLine(c, 60, 420, 740, 420, 3, colors.muted);
          strokeRect(c, 120, 460, 560, 90, 4, colors.navy);
          dashedLine(c, 140, 505, 300, 505, 4, colors.muted, 10, 8);
          dashedLine(c, 320, 505, 480, 505, 4, colors.muted, 10, 8);
          dashedLine(c, 500, 505, 660, 505, 4, colors.muted, 10, 8);
        }
      }
    ]
  }
];

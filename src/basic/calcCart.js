import { getProductList, prodList } from "./main.basic.js";
import { ElementIds } from "../constants.js";

/** DATA */
const discountRateById = {
  p1: 0.1,
  p2: 0.15,
  p3: 0.2,
  p4: 0.05,
  p5: 0.25,
};

/** CALCULATIONS */
function getDisc(quantity, currentItemId) {
  if (quantity < 10) {
    return 0;
  }
  return discountRateById[currentItemId] || 0;
}

function getFinalAmounts(itemCnt, totalAmt, subTot) {
  let discRate = 0;
  if (itemCnt >= 30) {
    const bulkDisc = totalAmt * 0.25;
    const itemDisc = subTot - totalAmt;
    if (bulkDisc > itemDisc) {
      totalAmt = subTot * (1 - 0.25);
      discRate = 0.25;
    } else {
      discRate = (subTot - totalAmt) / subTot;
    }
  } else {
    discRate = (subTot - totalAmt) / subTot;
  }
  if (new Date().getDay() === 2) {
    totalAmt *= 1 - 0.1;
    discRate = Math.max(discRate, 0.1);
  }

  return {
    totalAmt,
    discRate,
  };
}

function getBonusPts(totalAmt) {
  return Math.floor(totalAmt / 1000);
}

function getProductQuantityMessage(prodList) {
  let infoMsg = "";

  prodList.forEach(function (item) {
    if (item.q < 5) {
      infoMsg +=
        item.name +
        ": " +
        (item.q > 0 ? "재고 부족 (" + item.q + "개 남음)" : "품절") +
        "\n";
    }
  });

  return infoMsg;
}

/** ACTIONS **/
const renderBonusPts = (totalAmt) => {
  const sum = document.getElementById(ElementIds.SUM);
  let ptsTag = document.getElementById(ElementIds.LOYALTY_POINTS);

  if (!ptsTag) {
    ptsTag = document.createElement("span");
    ptsTag.id = ElementIds.LOYALTY_POINTS;
    ptsTag.className = "text-blue-500 ml-2";
    sum?.appendChild(ptsTag);
  }

  const bonusPts = getBonusPts(totalAmt);
  ptsTag.textContent = "(포인트: " + bonusPts + ")";
};

function updateStockInfo() {
  const stockInfo = document.getElementById(ElementIds.STOCK_INFO);
  const productList = getProductList();
  if (stockInfo) {
    stockInfo.textContent = getProductQuantityMessage(productList);
  }
}

function createDiscountRateMessage(discRate) {
  const span = document.createElement("span");
  span.className = "text-green-500 ml-2";
  span.textContent = "(" + (discRate * 100).toFixed(1) + "% 할인 적용)";
  return span;
}

export function calcCart() {
  const cartDisp = document.getElementById(ElementIds.CART_DISP);
  const cartItems = cartDisp?.children;

  let subTot = 0;
  let totalAmt = 0;
  let itemCnt = 0;

  for (let i = 0; i < cartItems.length; i++) {
    (function () {
      let curItem;
      for (let j = 0; j < prodList.length; j++) {
        if (prodList[j].id === cartItems[i].id) {
          curItem = prodList[j];
          break;
        }
      }
      const q = parseInt(
        cartItems[i].querySelector("span").textContent.split("x ")[1],
      );

      const itemTot = curItem.val * q;
      itemCnt += q;
      subTot += itemTot;

      const disc = getDisc(q, curItem.id);
      totalAmt += itemTot * (1 - disc);
    })();
  }

  const finalAmounts = getFinalAmounts(itemCnt, totalAmt, subTot);
  totalAmt = finalAmounts.totalAmt;

  const sum = document.getElementById(ElementIds.SUM);
  if (sum) {
    sum.textContent = "총액: " + Math.round(totalAmt) + "원";
  }

  if (finalAmounts.discRate > 0) {
    const discountRateSpan = createDiscountRateMessage(finalAmounts.discRate);

    sum?.appendChild(discountRateSpan);
  }
  updateStockInfo();
  renderBonusPts(totalAmt);
}

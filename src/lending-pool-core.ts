import { ReserveDataUpdated as ReserveDataUpdatedEvent, Supply as SupplyEvent, Withdraw as WithdrawEvent } from "../generated/LendingPoolCore/LendingPoolCore";
import { getDateFromEvent } from "./utils/common";
import { calculateApy } from "./utils/math";
import { /* APY,  */ReserveData, TotalDeposit, TotalDepositByMonth, TotalWithdraw, TotalWithdrawByMonth } from "../generated/schema";
import { BigDecimal, BigInt, log } from "@graphprotocol/graph-ts";

const RESERVE_ADDRESS = "0x82af49447d8a07e3bd95bd0d56f35241523fbab1"; //WETH

// when aave updates the pool data
export function handleReserveDataUpdated(
  event: ReserveDataUpdatedEvent
): void {
  if(!event) {
    return;
  }

  // if it's not weth
  if(event.params.reserve.toHexString() != RESERVE_ADDRESS) {
    return;
  }

  let dateStrings = getDateFromEvent(event);
  let dateStr = dateStrings.dateStr;

  // cant use these cause biggest allowable int is i64 instead of uint256
  // let apys = calculateApy(event);
  // let depositAPY = apys.depositAPY;
  // let variableBorrowAPY = apys.variableBorrowAPY;
  // let stableBorrowAPY = apys.stableBorrowAPY;

  // let apyByDate = APY.load(dateStr);
  // if(!apyByDate) {
  //   apyByDate = new APY(dateStr);
  //   apyByDate.deposit = new BigDecimal(new BigInt(0));
  //   apyByDate.stableBorrow = new BigDecimal(new BigInt(0));
  //   apyByDate.variableBorrow = new BigDecimal(new BigInt(0));
  // }
  // apyByDate.deposit = depositAPY;
  // apyByDate.stableBorrow = stableBorrowAPY;
  // apyByDate.variableBorrow = variableBorrowAPY;

  // apyByDate.save();

  let reserveDataByDate = ReserveData.load(dateStr);
  if(!reserveDataByDate){
    reserveDataByDate = new ReserveData(dateStr);
  }

  reserveDataByDate.supplyRate = event.params.liquidityRate;
  reserveDataByDate.stableBorrowRate = event.params.stableBorrowRate;
  reserveDataByDate.variableBorrowRate = event.params.variableBorrowRate;
  reserveDataByDate.save();
  return;
}

// when user supplies
export function handleSupply (event: SupplyEvent): void {
  if(!event) {
    return;
  }

  // if it's not weth
  if(event.params.reserve.toHexString() != RESERVE_ADDRESS) {
    return;
  }

  let dateStrings = getDateFromEvent(event);
  let dateStr = dateStrings.dateStr;
  let monthStr = dateStrings.monthStr;
  
  let amount = event.params.amount;
  let totalDeposit = TotalDeposit.load(dateStr);
  if(!totalDeposit) {
    totalDeposit = new TotalDeposit(dateStr);
    totalDeposit.value = new BigInt(0);
  }
  totalDeposit.value = totalDeposit.value.plus(amount);
  totalDeposit.save();
  
  let totalDepositByMonth = TotalDepositByMonth.load(monthStr);
  if(!totalDepositByMonth) {
    totalDepositByMonth = new TotalDepositByMonth(monthStr);
    totalDepositByMonth.value = new BigInt(0);
  }
  totalDepositByMonth.value = totalDepositByMonth.value.plus(amount);
  totalDepositByMonth.save();

  return;
}

// when user withdraws
export function handleWithdraw (event: WithdrawEvent): void {
  if(!event) {
    return;
  }

  // if it's not weth
  if(event.params.operator.toHexString() != RESERVE_ADDRESS) {
    return;
  }

  let dateStrings = getDateFromEvent(event);
  let dateStr = dateStrings.dateStr;
  let monthStr = dateStrings.monthStr;

  // need to do this cause if not it will have an error when deployed
  // wei units divided by 3 times = 18 decimals
  let amount = event.params.value;
  let totalWithdraw = TotalWithdraw.load(dateStr);
  if(!totalWithdraw) {
    totalWithdraw = new TotalWithdraw(dateStr);
    totalWithdraw.value = new BigInt(0);
  }
  totalWithdraw.value = totalWithdraw.value.plus(amount);
  totalWithdraw.save();
  
  let totalWithdrawByMonth = TotalWithdrawByMonth.load(monthStr);
  if(!totalWithdrawByMonth) {
    totalWithdrawByMonth = new TotalWithdrawByMonth(monthStr);
    totalWithdrawByMonth.value = new BigInt(0);
  }
  totalWithdrawByMonth.value = totalWithdrawByMonth.value.plus(amount);
  totalWithdrawByMonth.save();

  return;
}
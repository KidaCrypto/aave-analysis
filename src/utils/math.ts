import { BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import { ReserveDataUpdated as ReserveDataUpdatedEvent } from "../../generated/LendingPoolCore/LendingPoolCore";

// source: https://docs.aave.com/developers/v/2.0/guides/apy-and-apr
const RAY = 10**27; // power of 27
const SECONDS_PER_YEAR = 31536000;

// have to use class in graph
class APYS {
    depositAPY: BigDecimal;
    variableBorrowAPY: BigDecimal;
    stableBorrowAPY: BigDecimal;

    constructor(
        depositAPY: BigDecimal,
        variableBorrowAPY: BigDecimal,
        stableBorrowAPY: BigDecimal
    ) {
        this.depositAPY = depositAPY;
        this.variableBorrowAPY = variableBorrowAPY;
        this.stableBorrowAPY = stableBorrowAPY;
    }
}

export function calculateApy(event: ReserveDataUpdatedEvent): APYS {
    // Deposit and Borrow calculations
    // APY and APR are returned here as decimals, multiply by 100 to get the percents
    let params = event.params; // no deconstructor
    let liquidityRate = params.liquidityRate;
    let variableBorrowRate = params.variableBorrowRate;
    let stableBorrowRate = params.stableBorrowRate;

    // BigDecimal doesn't have pow function, so this may have some inaccuracies
    let depositAPR = liquidityRate.toI64() / RAY;
    let variableBorrowAPR = variableBorrowRate.toI64() / RAY;
    let stableBorrowAPR = stableBorrowRate.toI64() / RAY;

    let depositAPY = ((1 + (depositAPR / SECONDS_PER_YEAR)) ^ SECONDS_PER_YEAR) - 1;
    let variableBorrowAPY = ((1 + (variableBorrowAPR / SECONDS_PER_YEAR)) ^ SECONDS_PER_YEAR) - 1;
    let stableBorrowAPY = ((1 + (stableBorrowAPR / SECONDS_PER_YEAR)) ^ SECONDS_PER_YEAR) - 1;

    depositAPY = depositAPY * 100; // in %
    variableBorrowAPY = variableBorrowAPY * 100; // in %
    stableBorrowAPY = stableBorrowAPY * 100; // in %

    // further multiply it so that we have decimals in the BigInt to be returned
    depositAPY = depositAPY * 10**6;
    variableBorrowAPY = variableBorrowAPY * 10**6;
    stableBorrowAPY = stableBorrowAPY * 10**6;

    // divide it back in big decimal form
    let retDepositAPY = new BigInt(<i32>depositAPY).toBigDecimal().div((new BigInt(10**6)).toBigDecimal());
    let retVariableBorrowAPY = new BigInt(<i32>variableBorrowAPY).toBigDecimal().div((new BigInt(10**6)).toBigDecimal());
    let retStableBorrowAPY = new BigInt(<i32>stableBorrowAPY).toBigDecimal().div((new BigInt(10**6)).toBigDecimal());

    return new APYS(
        retDepositAPY,
        retVariableBorrowAPY,
        retStableBorrowAPY,
    );
}
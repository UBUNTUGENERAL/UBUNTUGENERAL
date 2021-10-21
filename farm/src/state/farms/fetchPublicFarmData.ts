import BigNumber from 'bignumber.js'
import masterchefABI from 'config/abi/masterchef.json'
import erc20 from 'config/abi/erc20.json'
import { getAddress, getMasterChefAddress } from 'utils/addressHelpers'
import { BIG_TEN, BIG_ZERO } from 'utils/bigNumber'
import multicall from 'utils/multicall'
import { SerializedFarmConfig } from 'config/constants/types'
import { SerializedBigNumber } from '../types'

interface Farm extends SerializedFarmConfig {
  tokenAmountMc?: SerializedBigNumber
  quoteTokenAmountMc?: SerializedBigNumber
  tokenAmountTotal?: SerializedBigNumber
  quoteTokenAmountTotal?: SerializedBigNumber
  lpTotalInQuoteToken?: SerializedBigNumber
  lpTotalSupply?: SerializedBigNumber
  tokenPriceVsQuote?: SerializedBigNumber
  poolWeight?: SerializedBigNumber
  depositFeeBP?: number
  userData?: {
    allowance: string
    tokenBalance: string
    stakedBalance: string
    earnings: string
  }
}

type PublicFarmData = {
  tokenAmountMc: SerializedBigNumber
  quoteTokenAmountMc: SerializedBigNumber
  tokenAmountTotal: SerializedBigNumber
  quoteTokenAmountTotal: SerializedBigNumber
  lpTotalInQuoteToken: SerializedBigNumber
  lpTotalSupply: SerializedBigNumber
  tokenPriceVsQuote: SerializedBigNumber
  poolWeight: SerializedBigNumber
  multiplier: string
  depositFeeBP: number
}

const fetchFarm = async (farm: Farm): Promise<PublicFarmData> => {
  const { pid, lpAddresses, token, quoteToken } = farm
  const lpAddress = getAddress(lpAddresses)
  const calls = [
    // Balance of token in the LP contract
    {
      address: getAddress(token.address),
      name: 'balanceOf',
      params: [lpAddress],
    },
    // Balance of quote token on LP contract
    {
      address: getAddress(quoteToken.address),
      name: 'balanceOf',
      params: [lpAddress],
    },
    // Balance of LP tokens in the master chef contract
    {
      address: farm.isTokenOnly ? getAddress(token.address) : lpAddress,
      name: 'balanceOf',
      params: [getMasterChefAddress()],
    },
    // Total supply of LP tokens
    {
      address: lpAddress,
      name: 'totalSupply',
    },
    // Token decimals
    {
      address: getAddress(token.address),
      name: 'decimals',
    },
    // Quote token decimals
    {
      address: getAddress(quoteToken.address),
      name: 'decimals',
    },
  ]

  const [tokenBalanceLP, quoteTokenBalanceLP, lpTokenBalanceMC, lpTotalSupply, tokenDecimals, quoteTokenDecimals] =
    await multicall(erc20, calls)


  let tokenAmountMc;
  let lpTotalInQuoteToken;
  let tokenPriceVsQuote;
  let tokenAmountTotal;
  let quoteTokenAmountTotal;
  let quoteTokenAmountMc;
  let lpTokenRatio;

  if(farm.isTokenOnly){
    lpTokenRatio = new BigNumber(lpTokenBalanceMC).div(new BigNumber(lpTotalSupply))
    tokenAmountTotal = new BigNumber(tokenBalanceLP).div(BIG_TEN.pow(tokenDecimals))
    quoteTokenAmountTotal = new BigNumber(quoteTokenBalanceLP).div(BIG_TEN.pow(quoteTokenDecimals))
    tokenAmountMc = new BigNumber(lpTokenBalanceMC).div(BIG_TEN.pow(quoteTokenDecimals));
    quoteTokenAmountMc = quoteTokenAmountTotal.times(lpTokenRatio)

    if(farm.token.symbol === 'BUSD' && farm.quoteToken.symbol === 'BUSD'){
      tokenPriceVsQuote = new BigNumber(1);
    }
    else{
      tokenPriceVsQuote = new BigNumber(quoteTokenBalanceLP).div(new BigNumber(tokenBalanceLP))
    }
    lpTotalInQuoteToken = tokenAmountMc.times(tokenPriceVsQuote)
  }
  else{

    // Ratio in % of LP tokens that are staked in the MC, vs the total number in circulation
    lpTokenRatio = new BigNumber(lpTokenBalanceMC).div(new BigNumber(lpTotalSupply))

    // Raw amount of token in the LP, including those not staked
    tokenAmountTotal = new BigNumber(tokenBalanceLP).div(BIG_TEN.pow(tokenDecimals))
    quoteTokenAmountTotal = new BigNumber(quoteTokenBalanceLP).div(BIG_TEN.pow(quoteTokenDecimals))

    // Amount of token in the LP that are staked in the MC (i.e amount of token * lp ratio)
    tokenAmountMc = tokenAmountTotal.times(lpTokenRatio)
    quoteTokenAmountMc = quoteTokenAmountTotal.times(lpTokenRatio)

    // Total staked in LP, in quote token value
    lpTotalInQuoteToken = quoteTokenAmountMc.times(new BigNumber(2))
  }

  // Only make masterchef calls if farm has pid
  const [info, totalAllocPoint] =
    pid || pid === 0 
      ? await multicall(masterchefABI, [
          {
            address: getMasterChefAddress(),
            name: 'poolInfo',
            params: [pid],
          },
          {
            address: getMasterChefAddress(),
            name: 'totalAllocPoint',
          },
        ])
      : [null, null]

  const allocPoint = info ? new BigNumber(info.allocPoint?._hex) : BIG_ZERO
  const depositFee = info ? info.depositFeeBP : BIG_ZERO
  const poolWeight = totalAllocPoint ? allocPoint.div(new BigNumber(totalAllocPoint)) : BIG_ZERO

  
  return {
    tokenAmountMc: tokenAmountMc.toJSON(),
    quoteTokenAmountMc: quoteTokenAmountMc.toJSON(),
    tokenAmountTotal: tokenAmountTotal.toJSON(),
    quoteTokenAmountTotal: quoteTokenAmountTotal.toJSON(),
    lpTotalSupply: new BigNumber(lpTotalSupply).toJSON(),
    lpTotalInQuoteToken: lpTotalInQuoteToken.toJSON(),
    depositFeeBP: (depositFee / 100),
    tokenPriceVsQuote: quoteTokenAmountTotal.div(tokenAmountTotal).toJSON(),
    poolWeight: poolWeight.toJSON(),
    multiplier: `${allocPoint.div(100).toString()}X`,
  }
}

export default fetchFarm

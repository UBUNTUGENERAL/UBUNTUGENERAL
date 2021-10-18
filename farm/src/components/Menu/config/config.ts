import { MenuItemsType, DropdownMenuItemType } from '@pancakeswap/uikit'
import { ContextApi } from 'contexts/Localization/types'
import { nftsBaseUrl, pancakeBunniesAddress, pancakeSquadAddress } from 'views/Nft/market/constants'

export type ConfigMenuItemsType = MenuItemsType & { hideSubNav?: boolean }

const config: (t: ContextApi['t']) => ConfigMenuItemsType[] = (t) => [
  {
    label: t('Home'),
    icon: 'Swap',
    href: '/',
    items: []
  },
  {
    label: t('Trade'),
    icon: 'Swap',
    href: '/swap',
    showItemsOnMobile: false,
    items: [
      {
        label: t('Exchange'),
        href: '/swap',
      },
      {
        label: t('Liquidity'),
        href: '/liquidity',
      },
    ],
  },
  {
    label: t('Yield Farms'),
    href: '/farms',
    items: []
  },
  {
    label: t('Syrup Pools'),
    href: '/pools',
    items: []
  },

  // {
  //   label: t('Win'),
  //   href: '/prediction',
  //   icon: 'Trophy',
  //   items: [
  //     {
  //       label: t('Prediction (BETA)'),
  //       href: '/prediction',
  //     },
  //     {
  //       label: t('Lottery'),
  //       href: '/lottery',
  //     },
  //   ],
  // },
  // {
  //   label: t('NFT'),
  //   href: `${nftsBaseUrl}`,
  //   icon: 'Nft',
  //   items: [
  //     {
  //       label: t('Overview'),
  //       href: `${nftsBaseUrl}`,
  //       status: {
  //         text: t('Live'),
  //         color: 'failure',
  //       },
  //     },
  //     {
  //       label: t('Bunnies'),
  //       href: `${nftsBaseUrl}/collections/${pancakeBunniesAddress}`,
  //     },
  //     {
  //       label: t('Squad'),
  //       href: `${nftsBaseUrl}/collections/${pancakeSquadAddress}`,
  //     },
  //   ],
  // },
  {
    label: '',
    href: '/',
    icon: 'More',
    hideSubNav: true,
    items: [
      {
        label: t('White Paper'),
        href: '/info',
      },
      {
        label: t('BUY PRESALE'),
        href: 'https://ico.ubuntutokens.com/register',
        type: DropdownMenuItemType.EXTERNAL_LINK,
      },
      {
        label: t('CLAIM AIRDROP'),
        href: 'https://docs.google.com/forms/d/e/1FAIpQLSfrzIyxyikH6srI5vOctqehYvHkOJCSbj4Csao9HQYYwtpe5Q/viewform',
        type: DropdownMenuItemType.EXTERNAL_LINK,
      },
      // {
      //   type: DropdownMenuItemType.DIVIDER,
      // },
      // {
      //   label: t('Leaderboard'),
      //   href: '/teams',
      // },
      // {
      //   type: DropdownMenuItemType.DIVIDER,
      // },
      // {
      //   label: t('Blog'),
      //   href: 'https://pancakeswap.medium.com',
      //   type: DropdownMenuItemType.EXTERNAL_LINK,
      // },
      // {
      //   label: t('Docs'),
      //   href: 'https://docs.pancakeswap.finance',
      //   type: DropdownMenuItemType.EXTERNAL_LINK,
      // },
    ],
  },
]

export default config

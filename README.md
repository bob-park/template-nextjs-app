이 Repository 는 Next JS 에 설정이 모두 완료된 Repository 이다. (feat. Bob Park)

## `KeyFlow Authroization Server` 연동
기본적으로 `KeyFlow Authroization Server` 와 연동된 `Back-End For Front-End` 와 연동되어져 있다.
로그인되어 있지 않는 경우 `login page` 로 `redirect` 



## Spec

- typescript 5
- eslint 9
- prettier
- nextjs 16
- react 19
- react-scan
- react-icon
- react-query (tanstack-query) 5
- tailwindcss 4
- daisyui 5
- zustand 5
- sockjs




## eslint + prettier
eslint + prettier 는 Bob Park Repository 에 따른다.
- eslint: https://github.com/bob-park/eslint-config-bobpark
- prettier: https://github.com/bob-park/prettier-config-bobpark


## Project node version management 
node version 관리는 기본적으로 `mise` (mise en place) 로 구성한다.

`mise` 설정시 다음과 같이 명령어를 실행한다.
```bash
mise trust

# node 적용된 버전 확인
mise ls 
```


## dir 구조
```text
src
├── app # app router
│   └── api # app api router
│       └── health # health check api
├── domain # domain
│   └── users
│       ├── apis # api request
│       ├── components # domain components
│       ├── queries # react-query components
│       └── store # zustand store
├── shared
│   ├── api
│   ├── components
│   │   ├── queries
│   │   ├── scan
│   │   ├── timeago
│   │   └── toast
│   ├── dayjs
│   ├── hooks
│   ├── queries
│   └── store
└── utils
```

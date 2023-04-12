import{_ as b}from"./PageHeader.935cdc4f.js";import{_ as C}from"./ExternalLinkButton.f9a3fb92.js";import{a as y,h as g,G as k,o as a,c as E,w as _,e as t,f as e,t as h,b as l,F as m,r as p}from"./entry.cf8c1731.js";import{u as S}from"./groups.03db9c62.js";import"./index.145ce648.js";const B={name:"ElectorateCard",components:{Card:g},props:{electorate:Object}},L={class:"text-muted text-uppercase"};function T(o,n,c,v,w,i){const d=g,r=k("router-link");return a(),E(r,{class:"router-link",to:"/electorates/"+c.electorate.slug},{default:_(()=>[t(d,null,{default:_(()=>[e("h5",null,[e("strong",null,h(c.electorate.name),1)]),e("span",L,h(c.electorate.type),1)]),_:1})]),_:1},8,["to"])}const f=y(B,[["render",T],["__scopeId","data-v-33c62da5"]]),$={name:"Electorates",setup(){return{groupsStore:S()}},created(){this.groupsStore.fetchElectorates("allCurrent"),this.groupsStore.fetchElectorates("allHistoric")},computed:{electorates(){return(this.groupsStore.byName("allCurrent","electorates")||[]).sort((o,n)=>o.slug.toLowerCase()<n.slug.toLowerCase()?-1:1)},historicElectorates(){return(this.groupsStore.byName("allHistoric","electorates")||[]).sort((o,n)=>o.slug.toLowerCase()<n.slug.toLowerCase()?-1:1)}},components:{ElectorateCard:f}},z={class:"container"},P={class:"row mt-3"},H={class:"col-12"},N=e("h4",null,"New Zealand has 72 electoral districts, commonly known as electorates.",-1),F=e("p",null,"There are 65 general electorates and 7 Māori electorates. The number, sizes, shapes, and names of these electorates are determined by the Representation Commission after each Census in accordance with requirements set out in the Electoral Act 1993. Generally, this means that the electorate boundaries are reviewed every eight years, or after every second general election.",-1),M=e("p",null,"At an election, voters cast a vote for a candidate who is contesting the electorate they live in. Whichever candidate receives the most votes (a plurality) becomes that electorate's Member of Parliament. In a general election, voters also cast a vote for their preferred political party; this vote determines how the remaining seats in Parliament (usually another 48 seats) are filled.",-1),V=e("p",null,"By-elections are special, one-off elections that take place in an electorate outside the normal election cycle. These happen when an electorate MP leaves Parliament early, usually by resigning, and a new electorate MP needs to be elected to replace them. In 2022, there were two by-elections: one in Tauranga, and one in Hamilton West.",-1),W=e("h5",{class:"mt-3"},"Current electorates",-1),G={class:"row"},I=e("h5",{class:"mt-3"},"Former electorates",-1),A=e("p",{class:"mt-0"},"Only electorates that have existed since 2014 have profiles on WhereTheyStand.",-1),D={class:"row"};function O(o,n,c,v,w,i){const d=b,r=C,u=f;return a(),l("div",null,[t(d,{pageTitle:"Electorates"}),e("div",z,[e("div",P,[e("div",H,[N,F,M,t(r,{link:"https://vote.nz/enrolling/get-ready-to-enrol/find-your-electorate-on-a-map/",text:"Find your electorate on a map"}),t(r,{link:"https://elections.nz/democracy-in-nz/historical-events/boundary-review-2019-2020/",text:"Learn about the 2019-2020 Electorate Boundary Review"}),V,t(r,{link:"https://tauranga.election.wheretheystand.nz/",text:"View Tauranga by-election results (June 2022)"}),t(r,{link:"https://election.wheretheystand.nz/",text:"View Hamilton West by-election results (December 2022)"}),W,e("div",G,[(a(!0),l(m,null,p(i.electorates,(s,x)=>(a(),l("div",{key:s.id,class:"col-12 col-md-6 col-lg-4 col-xl-3"},[t(u,{electorate:s},null,8,["electorate"])]))),128))]),I,A,e("div",D,[(a(!0),l(m,null,p(i.historicElectorates,(s,x)=>(a(),l("div",{key:s.id,class:"col-12 col-md-6 col-lg-4 col-xl-3"},[t(u,{electorate:s},null,8,["electorate"])]))),128))])])])])])}const K=y($,[["render",O]]);export{K as default};
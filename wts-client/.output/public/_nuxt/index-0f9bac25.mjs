import{_ as F}from"./Spinner-dfd0837a.mjs";import{_ as g,d as b,g as D,p as B,r as x,o as t,l as p,w as _,a as l,b as o,t as d,c as n,i as S,h as m,F as C,m as O,q as j,j as V,n as A,e as h,Q as L}from"./entry-6994fce1.mjs";import{_ as R}from"./DisplayControlButton-c07e4965.mjs";import{f as q}from"./index-f958d92a.mjs";const z={name:"PersonPersonalVote",components:{Card:b},props:{record:Object},methods:{dateFormat(i){return D(B(i,"yyyy-MM-dd",new Date),"d.M.yyyy")},readingName(i){return{1:"1st reading",2:"2nd reading",3:"3rd reading"}[i]}}},P=i=>(O("data-v-1611cb2e"),i=i(),j(),i),E={class:"row"},W={key:0},H={class:"vote-info"},Q=P(()=>o("br",null,null,-1)),Z=P(()=>o("br",null,null,-1)),G={class:"vote-info text-muted"};function J(i,s,r,k,c,e){const a=x("FontAwesomeIcon"),y=V,v=b;return t(),p(v,null,{default:_(()=>[l(y,{class:"router-link",to:"/bills/"+r.record.bill.id},{default:_(()=>[o("h5",null,d(r.record.bill.name),1),o("div",E,[(t(!0),n(C,null,S(r.record.votes,(u,w)=>(t(),n("div",{class:"col-4 text-center",key:w},[u.position?(t(),n("div",W,[o("span",H,d(e.readingName(w)),1),Q,u.position==="y"?(t(),p(a,{key:0,title:"Supported",class:"position-icon yes",icon:["fas","check"]})):u.position==="n"?(t(),p(a,{key:1,title:"Opposed",class:"position-icon no",icon:["fas","times"]})):u.position==="a"?(t(),p(a,{key:2,title:"Abstained",class:"position-icon abstain",icon:["fas","map-signs"]})):u.position==="x"?(t(),p(a,{key:3,title:"Absent",class:"position-icon absent",icon:["fas","question"]})):m("",!0),Z,o("span",G,d(e.dateFormat(u.date)),1)])):m("",!0)]))),128))])]),_:1},8,["to"])]),_:1})}var K=g(z,[["render",J],["__scopeId","data-v-1611cb2e"]]);const U={name:"InlinePersonText",props:["entity"]},X={class:"inline-entity"};function Y(i,s,r,k,c,e){const a=x("router-link");return t(),p(a,{class:"link",to:"/people/"+r.entity.slug},{default:_(()=>[o("span",X,[r.entity.colour?(t(),n("span",{key:0,class:"party-dot",style:A({backgroundColor:r.entity.colour})},null,4)):m("",!0),h(" "+d(r.entity.display_name),1)])]),_:1},8,["to"])}var N=g(U,[["render",Y],["__scopeId","data-v-519fa4d2"]]);const $={name:"VotingSimilarityDisplay",components:{Card:b,InlinePersonText:N},props:{person:Object,similarityReport:Object}},ee=o("p",null,"Voting similarity is based on the proportion of common voting positions in personal reading votes, with a minimum sample size of four votes.",-1);function te(i,s,r,k,c,e){const a=N,y=b;return t(),p(y,{gradient:!0},{default:_(()=>[o("h5",null,d(r.person.display_name)+" votes most similarly to:",1),(t(!0),n(C,null,S(r.similarityReport.people,v=>(t(),n("span",{key:v.slug},[l(a,{entity:v,class:"mr-2 mb-2"},null,8,["entity"])]))),128)),ee]),_:1})}var oe=g($,[["render",te]]);const ne={name:"SmallBill",components:{Card:b},props:{bill:Object},computed:{relativeDate(){return q(B(this.bill.date_modified,"yyyy-MM-dd",new Date))+" ago"},formattedDate(){return D(B(this.bill.date_modified,"yyyy-MM-dd",new Date),"d.M.yyyy")}}},se=["title"];function ie(i,s,r,k,c,e){const a=x("font-awesome-icon"),y=b,v=V;return t(),p(v,{class:"router-link",to:"/bills/"+r.bill.id},{default:_(()=>[l(y,null,{default:_(()=>[o("h5",null,d(r.bill.name),1),o("p",null,d(r.bill.description),1),r.bill.date_modified?(t(),n("span",{key:0,title:e.formattedDate,class:"text-muted"},[l(a,{icon:["fas","history"]}),h(" Last activity "+d(e.relativeDate),1)],8,se)):m("",!0)]),_:1})]),_:1},8,["to"])}var le=g(ne,[["render",ie],["__scopeId","data-v-7916337c"]]);const re={name:"PersonHome",setup(){return{peopleStore:L()}},data(){return{voteCount:4,billCount:4}},created(){this.peopleStore.fetchVotes(this.$route.params.id),this.peopleStore.fetchBills(this.$route.params.id),this.peopleStore.fetchVotingSimilarity(this.$route.params.id)},computed:{votes(){return this.peopleStore.votesByIdentifier(this.$route.params.id)},bills(){return this.peopleStore.billsByIdentifier(this.$route.params.id)},person(){return this.peopleStore.byIdentifier(this.$route.params.id)},votingSimilarity(){return this.peopleStore.votingSimilarityByIdentifier(this.$route.params.id)},votesByBill(){var i={};return!this.votes||this.votes.length===0?[]:(this.votes.forEach(s=>{s.vote.bill.id in i||(i[s.vote.bill.id]={bill:s.vote.bill,votes:{1:{},2:{},3:{}}}),i[s.vote.bill.id].votes[s.vote.reading]={position:s.position,date:s.date}}),Object.values(i))}}},ae={class:"container"},ce={class:"row mt-3"},_e={class:"col-12 col-lg-8"},de=o("h4",null,"Personal voting history",-1),ue={key:0},me=h(" WhereTheyStand doesn't have any votes to show you."),pe={key:1},he=h(" Loading..."),ye={key:2,class:"row"},ve={key:3},fe=h(" Show all votes "),be={key:4},ge=h(" Show fewer votes "),ke={key:0,class:"col-12 col-lg-4"},we=o("h4",null,"Voting similarity",-1),Se={class:"row"},Ce={class:"col-12"},xe=o("p",null,"This feature is coming soon, so please check back at a later date.",-1),Be=o("p",null,"In the meantime, click on any voting record to see more information about that bill and its votes.",-1),Ie={class:"row"},De={class:"col-12"},Ve=o("h4",null,"Bills responsible for",-1),Pe={key:0,class:"col-12 col-lg-8"},Ne={key:1},Me=h(" Loading..."),Te={key:2,class:"row"},Fe={key:3},Oe=h(" Show all bills "),je={key:4},Ae=h(" Show fewer bills ");function Le(i,s,r,k,c,e){const a=x("FontAwesomeIcon"),y=F,v=K,u=R,w=oe,I=b,M=le;return t(),n("div",ae,[o("div",ce,[o("div",_e,[de,e.votes&&e.votes.length===0?(t(),n("p",ue,[l(a,{icon:["fas","info-circle"]}),me])):e.votes?m("",!0):(t(),n("p",pe,[l(y),he])),e.votes?(t(),n("div",ye,[(t(!0),n(C,null,S(e.votesByBill.slice(0,c.voteCount),(f,T)=>(t(),n("div",{key:T,class:"col-12 col-lg-6"},[l(v,{record:f},null,8,["record"])]))),128))])):m("",!0),e.votesByBill.length>c.voteCount?(t(),n("div",ve,[l(u,{onClick:s[0]||(s[0]=f=>c.voteCount=e.votesByBill.length)},{default:_(()=>[l(a,{icon:["fas","chevron-down"]}),fe]),_:1})])):c.voteCount===e.votesByBill.length&&c.voteCount>4?(t(),n("div",be,[l(u,{onClick:s[1]||(s[1]=f=>c.voteCount=4)},{default:_(()=>[l(a,{icon:["fas","chevron-up"]}),ge]),_:1})])):m("",!0)]),e.votingSimilarity&&e.votingSimilarity!={}?(t(),n("div",ke,[we,o("div",Se,[o("div",Ce,[e.votingSimilarity.status=="complete"?(t(),p(w,{key:0,person:e.person,similarityReport:e.votingSimilarity},null,8,["person","similarityReport"])):e.votingSimilarity.status=="insufficient"?(t(),p(I,{key:1,gradient:!0},{default:_(()=>[o("p",null,[o("strong",null,"There isn't enough data to show who "+d(e.person.display_name)+" votes similarly to.",1)]),o("p",null,"Once "+d(e.person.display_name)+" has participated in enough personal votes, you will be able to see a list of MPs who tend to vote the same way. Personal votes don't happen often in New Zealand, so it may be some time.",1)]),_:1})):(t(),p(I,{key:2,gradient:!0},{default:_(()=>[o("p",null,[o("strong",null,"WhereTheyStand hasn't checked who "+d(e.person.display_name)+" votes similarly to.",1)]),xe,Be]),_:1}))])])])):m("",!0)]),o("div",Ie,[o("div",De,[Ve,e.bills&&e.bills.length===0?(t(),n("p",Pe,[l(a,{icon:["fas","info-circle"]}),h(" "+d(e.person.display_name)+" hasn't sponsored any bills. This doesn't include any member's bills that they might have sitting in the 'biscut tin' which haven't been drawn yet.",1)])):e.bills?m("",!0):(t(),n("p",Ne,[l(y),Me])),e.bills?(t(),n("div",Te,[(t(!0),n(C,null,S(e.bills.slice(0,c.billCount),f=>(t(),n("div",{class:"col-12 col-md-6",key:f.id},[l(M,{bill:f},null,8,["bill"])]))),128))])):m("",!0),e.bills&&e.bills.length>c.billCount?(t(),n("div",Fe,[l(u,{onClick:s[2]||(s[2]=f=>c.billCount=e.bills.length)},{default:_(()=>[l(a,{icon:["fas","chevron-down"]}),Oe]),_:1})])):e.bills&&c.billCount===e.bills.length&&c.billCount>4?(t(),n("div",je,[l(u,{onClick:s[3]||(s[3]=f=>c.billCount=4)},{default:_(()=>[l(a,{icon:["fas","chevron-up"]}),Ae]),_:1})])):m("",!0)])])])}var We=g(re,[["render",Le]]);export{We as default};

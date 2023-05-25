import{_ as O}from"./PageHeader.04337ea1.js";import{a as p,N as x,O as A,J as D,o as c,b as a,f as e,e as n,i as l,l as f,x as k,t as h,w as u,F as b,r as I,c as L,k as w,h as B,q as C,s as T,v as P}from"./entry.9d4e3339.js";import{f as z}from"./index.dcb4ea67.js";import{p as F}from"./index.58aab3e7.js";import{_ as Y}from"./Spinner.4568d224.js";import"./index.145ce648.js";import"./index.b85c6916.js";const M={name:"SignOutButton",setup(){const{isLoading:o,isAuthorized:i,username:s,firstName:t,lastName:d}=x();return{isLoading:o,isAuthorized:i,username:s,firstName:t,lastName:d}},methods:{async signOut(){await new A().signOut()&&D("/")}}},V={key:0,class:"container-fluid",style:{"background-color":"rgb(52, 148, 148)"}},W={class:"container py-2"};function j(o,i,s,t,d,r){const g=k;return t.isAuthorized?(c(),a("div",V,[e("div",W,[e("a",{class:"back-link",href:"#",onClick:i[0]||(i[0]=v=>r.signOut())},[n(g,{icon:["fas","arrow-left"]}),l(" Sign out ")])])])):f("",!0)}const E=p(M,[["render",j],["__scopeId","data-v-70080f02"]]),q={name:"WebauthnDevice",props:["device"],methods:{relativeDate(o){return z(F(o))+" ago"}}},H={class:"row"},J={class:"col-12 col-md-6"},U=e("strong",null,"Created:",-1),G={class:"col-12 col-md-6"},K=e("strong",null,"Last used:",-1),Q={class:"col-12 col-md-6"},R=e("strong",null,"Used: ",-1),X={key:0},Z=e("hr",null,null,-1);function ee(o,i,s,t,d,r){return c(),a("div",null,[e("h6",null,h(s.device.friendly_name),1),e("div",H,[e("div",J,[U,l(" "+h(r.relativeDate(s.device.created_at)),1)]),e("div",G,[K,l(" "+h(r.relativeDate(s.device.last_login_at)),1)]),e("div",Q,[R,l(h(s.device.usage_count)+" time",1),s.device.usage_count!=1?(c(),a("span",X,"s")):f("",!0),l(". ")])]),Z])}const te=p(q,[["render",ee]]);const ne={name:"MePage",setup(){const{isLoading:o,isAuthorized:i,username:s,firstName:t,lastName:d,webauthnDevices:r}=x();return{isLoading:o,isAuthorized:i,username:s,firstName:t,lastName:d,webauthnDevices:r}}},_=o=>(T("data-v-0223ff05"),o=o(),P(),o),oe={key:0,class:"row mt-3"},se={class:"col-xl-6 col-lg-6 col-12"},ce=_(()=>e("h4",null,"Authentication",-1)),_e=_(()=>e("span",null,"You don't have a password; you log in using a passkey or a one-time code.",-1)),ae=_(()=>e("h5",null,"Your details",-1)),ie=_(()=>e("strong",null,"Email address: ",-1)),le=_(()=>e("hr",null,null,-1)),de={class:"property-list"},re={key:0},ue=_(()=>e("strong",null,"First name: ",-1)),he={key:1},me=_(()=>e("strong",null,"Surname: ",-1)),fe=_(()=>e("h5",null,"Passkeys",-1)),pe={class:"col-xl-6 col-lg-6 col-12"},ge=_(()=>e("h4",null,"Authorisations",-1)),ve=_(()=>e("span",null,"These roles and permissions keep track of what you're allowed to do on WhereTheyStand.",-1)),ye={key:1,class:"row mt-3"},xe={class:"d-flex justify-content-center"},ke={class:"col-xl-4 col-lg-5 col-12"},we=_(()=>e("h4",null,"You need to sign in.",-1)),$e={key:2,class:"row mt-3"},Ne={class:"d-flex justify-content-center"},Se={class:"col-xl-4 col-lg-5 col-12"},Oe=_(()=>e("h4",null,"Loading...",-1));function Ae(o,i,s,t,d,r){const g=te,v=w,m=B,$=k,N=C,S=Y;return c(),a("div",null,[t.isAuthorized?(c(),a("div",oe,[e("div",se,[ce,_e,n(m,null,{default:u(()=>[n(v,null,{default:u(()=>[ae,ie,l(" "+h(t.username)+" ",1),le,e("ul",de,[t.firstName.length>1?(c(),a("li",re,[ue,l(h(t.firstName),1)])):f("",!0),t.lastName.length>1?(c(),a("li",he,[me,l(h(t.lastName),1)])):f("",!0)]),fe,(c(!0),a(b,null,I(t.webauthnDevices,y=>(c(),L(g,{key:y.id,device:y},null,8,["device"]))),128))]),_:1})]),_:1})]),e("div",pe,[ge,ve,n(m,null,{default:u(()=>[n(v,null,{default:u(()=>[l(" You have no authorisations. ")]),_:1})]),_:1})])])):!t.isLoading&&!t.isAuthorized?(c(),a("div",ye,[e("div",xe,[e("div",ke,[we,n(m,{class:"text-center"},{default:u(()=>[n(N,{to:"/auth"},{default:u(()=>[l("Sign in "),n($,{icon:["fas","arrow-right"]})]),_:1})]),_:1})])])])):(c(),a("div",$e,[e("div",Ne,[e("div",Se,[Oe,n(m,{class:"text-center"},{default:u(()=>[n(S)]),_:1})])])]))])}const De=p(ne,[["render",Ae],["__scopeId","data-v-0223ff05"]]),be={},Ie={class:"container"};function Le(o,i){const s=O,t=E,d=w,r=De;return c(),a("div",null,[n(s,{pageTitle:"Your WhereTheyStand account"}),n(d,null,{default:u(()=>[n(t)]),_:1}),e("div",Ie,[n(d,{placeholder:"Loading profile view."},{default:u(()=>[n(r)]),_:1})])])}const Me=p(be,[["render",Le]]);export{Me as default};

import{_ as i}from"./ColourDot-36430abb.mjs";import{_ as p,d,r as h,o,l as r,w as l,a as k,c as n,b as t,h as s,t as c,e as _}from"./entry-6994fce1.mjs";const x={name:"PersonCard",components:{Card:d,ColourDot:i},props:{person:Object}},f={key:0,class:"d-flex align-items-center"},g={class:"flex-shrink-0"},y=["src","alt"],v={class:"flex-grow-1 ms-3"},C={class:"text-muted"},B={key:1},N={key:0,class:"text-muted"};function V(w,b,e,D,j,E){const a=i,u=d,m=h("router-link");return o(),r(m,{class:"router-link",to:"/people/"+e.person.slug},{default:l(()=>[k(u,null,{default:l(()=>[e.person.image?(o(),n("div",f,[t("div",g,[e.person.image?(o(),n("img",{key:0,src:e.person.image,class:"me-3 person-image",alt:e.person.display_name},null,8,y)):s("",!0)]),t("div",v,[t("h5",null,[t("strong",null,c(e.person.display_name),1)]),t("p",C,[e.person.colour?(o(),r(a,{key:0,colour:e.person.colour},null,8,["colour"])):s("",!0),_(c(e.person.description),1)])])])):(o(),n("div",B,[t("h5",null,[t("strong",null,c(e.person.display_name),1)]),e.person.description?(o(),n("p",N,[e.person.colour?(o(),r(a,{key:0,colour:e.person.colour},null,8,["colour"])):s("",!0),_(c(e.person.description),1)])):s("",!0)]))]),_:1})]),_:1},8,["to"])}var P=p(x,[["render",V],["__scopeId","data-v-2e17528c"]]);export{P as _};

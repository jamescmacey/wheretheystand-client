import{_ as g,r as x,o as s,l as D,w as u,a as r,e as _,t as l,Q as P,g as R,p as B,c as a,b as e,G as L,J as N,h as o,d as I,R as E,F as b,i as v,j as F}from"./entry-6994fce1.mjs";import{_ as O}from"./DisplayControlButton-c07e4965.mjs";import{_ as T}from"./ColourDot-36430abb.mjs";import{_ as C}from"./ExternalLinkButton-793aa0d9.mjs";const V={name:"SocialMediaLink",components:{ExternalLinkButton:C},props:{username:String,platform:{validator:function(i){return["snapchat","wikipedia","facebook","instagram"].indexOf(i)!==-1}}},computed:{iconName(){switch(this.platform){case"snapchat":return"snapchat";case"wikipedia":return"wikipedia-w";case"instagram":return"instagram";case"facebook":return"facebook";case"twitter":return"twitter";default:return""}},prefix(){switch(this.platform){case"snapchat":return"";case"wikipedia":return"";case"instagram":return"@";case"facebook":return"";case"twitter":return"@";default:return""}},link(){switch(this.platform){case"snapchat":return"https://www.snapchat.com/add/"+this.username;case"wikipedia":return"https://en.wikipedia.org/wiki/"+this.username;case"instagram":return"https://www.instagram.com/"+this.username;case"facebook":return"https://www.facebook.com/"+this.username;case"twitter":return"https://twitter.com/"+this.username;default:return""}}}};function j(i,d,h,A,c,t){const m=x("font-awesome-icon"),p=C;return s(),D(p,{link:t.link},{default:u(()=>[r(m,{icon:["fab",t.iconName]},null,8,["icon"]),_(" "+l(t.prefix)+l(h.username),1)]),_:1},8,["link"])}var W=g(V,[["render",j]]);const G={name:"PersonDetails",setup(){return{peopleStore:P()}},data(){return{showReasons:!1,parliamentaryAffiliationCount:1}},created(){this.peopleStore.fetchDetails(this.$route.params.id)},mounted(){},methods:{formatDate(i){return R(B(i,"yyyy-MM-dd",new Date),"d MMMM yyyy")},ordinal_suffix_of(i){var d=i%10,h=i%100;return d===1&&h!==11?i+"st":d===2&&h!==12?i+"nd":d===3&&h!==13?i+"rd":i+"th"}},computed:{details(){return this.peopleStore.detailsByIdentifier(this.$route.params.id)},currentAge(){return"TODO years"},ageAtDeath(){return"TODO years"}}},H={class:"container"},J={key:0,class:"row mt-3"},Q={class:"col-12 col-md-6"},U=e("h4",null,"Parliamentary history",-1),q={class:"form-check"},z=e("label",{class:"form-check-label",for:"showReasons"}," Show reasons ",-1),K={key:0},X=_("MP for "),Y={key:1},Z=_("MP for "),$={class:"text-uppercase text-muted"},ee={key:2},te={class:"row"},se={class:"col-12 col-md-6"},ae=e("strong",null,"Started:",-1),ne=e("br",null,null,-1),oe={key:0},le=e("strong",null,"Reason:",-1),re={key:0,class:"col-12 col-md-6"},_e=e("strong",null,"Ended:",-1),ie=e("br",null,null,-1),de={key:0},ce=e("strong",null,"Reason:",-1),ue=e("hr",null,null,-1),he=e("p",{class:"text-muted"},"These dates correspond to when an MP was eligible to sit and vote in the House of Representatives, not when they were declared elected.",-1),me={key:0},pe=_(" Show all Parliamentary affiliations "),ke={key:1},fe=_(" Show fewer Parliamentary affiliations "),ye={class:"col-12 col-md-6"},we=e("h4",null,"Party history",-1),be={class:"row"},ve={class:"col-12 col-md-6"},ge=e("strong",null,"Started:",-1),xe=e("br",null,null,-1),De={key:0,class:"col-12 col-md-6"},Ce=e("strong",null,"Ended:",-1),Ae=e("br",null,null,-1),Se={key:0},Me={key:1,class:"row"},Pe={key:0,class:"col-12 col-md-6"},Re=e("h4",null,"Contacts and social media",-1),Be=[Re],Le={key:2,class:"row"},Ne={key:0,class:"col-12 col-md-6"},Ie={class:"col-12 col-md-6"},Ee=e("h5",null,"Bio",-1),Fe={key:0},Oe=e("h6",null,"Email address",-1),Te={class:"text-lowercase"},Ve=e("hr",null,null,-1),je={key:1},We=e("h6",null,"Date of Birth",-1),Ge=e("hr",null,null,-1),He={key:2},Je=e("h6",null,"Age",-1),Qe=e("hr",null,null,-1),Ue={key:3},qe=e("h6",null,"Passed away",-1),ze=e("hr",null,null,-1),Ke={key:4},Xe=e("h6",null,"Age at death",-1),Ye=e("hr",null,null,-1),Ze={key:5},$e=e("h6",null,"Wikidata ID",-1),et=e("hr",null,null,-1),tt={key:6},st=e("h6",null,"Alexander Turnbull Library ID",-1),at=e("hr",null,null,-1),nt={key:7},ot=e("h6",null,"Snapchat",-1),lt=e("hr",null,null,-1),rt={key:8},_t=e("h6",null,"Instagram",-1),it=e("hr",null,null,-1),dt={key:9},ct=e("h6",null,"Facebook",-1),ut=e("hr",null,null,-1),ht={key:10},mt=e("h6",null,"Wikipedia",-1),pt=e("hr",null,null,-1);function kt(i,d,h,A,c,t){const m=F,p=I,y=x("FontAwesomeIcon"),w=O,S=T,M=E,k=W;return s(),a("div",H,[t.details?(s(),a("div",J,[e("div",Q,[U,e("div",q,[L(e("input",{class:"form-check-input",type:"checkbox",value:"","onUpdate:modelValue":d[0]||(d[0]=n=>c.showReasons=n),id:"showReasons"},null,512),[[N,c.showReasons]]),z]),r(p,null,{default:u(()=>[(s(!0),a(b,null,v(t.details.parliamentary_affiliations.slice(0,c.parliamentaryAffiliationCount),(n,f)=>(s(),a("div",{key:f},[n.electorate?(s(),a("h5",K,[X,r(m,{to:"/electorates/"+n.electorate.slug},{default:u(()=>[_(l(n.electorate.name),1)]),_:2},1032,["to"])])):n.fallback_electorate_slug?(s(),a("h5",Y,[Z,e("span",$,l(n.fallback_electorate_slug),1)])):(s(),a("h5",ee,"List MP")),e("h6",null,[r(m,{to:"/parliaments/"+n.parliament.number},{default:u(()=>[_(l(t.ordinal_suffix_of(n.parliament.number))+" Parliament",1)]),_:2},1032,["to"])]),e("div",te,[e("div",se,[ae,_(" "+l(t.formatDate(n.start_date)),1),ne,n.start_reason_desc&&c.showReasons?(s(),a("span",oe,[le,_(" "+l(n.start_reason_desc),1)])):o("",!0)]),n.end_date?(s(),a("div",re,[_e,_(" "+l(t.formatDate(n.end_date)),1),ie,n.end_reason_desc&&c.showReasons?(s(),a("span",de,[ce,_(" "+l(n.end_reason_desc),1)])):o("",!0)])):o("",!0)]),ue]))),128)),he]),_:1}),t.details.parliamentary_affiliations.length>c.parliamentaryAffiliationCount?(s(),a("div",me,[r(w,{onClick:d[1]||(d[1]=n=>c.parliamentaryAffiliationCount=t.details.parliamentary_affiliations.length)},{default:u(()=>[r(y,{icon:["fas","chevron-down"]}),pe]),_:1})])):c.parliamentaryAffiliationCount===t.details.parliamentary_affiliations.length&&c.parliamentaryAffiliationCount>1?(s(),a("div",ke,[r(w,{onClick:d[2]||(d[2]=n=>c.parliamentaryAffiliationCount=1)},{default:u(()=>[r(y,{icon:["fas","chevron-up"]}),fe]),_:1})])):o("",!0)]),e("div",ye,[we,r(p,null,{default:u(()=>[(s(!0),a(b,null,v(t.details.party_affiliations,(n,f)=>(s(),a("div",{key:f},[e("h5",null,[n.party.colour?(s(),D(S,{key:0,colour:n.party.colour},null,8,["colour"])):o("",!0),r(m,{to:"/parties/"+n.party.slug},{default:u(()=>[_(l(n.party.display_name),1)]),_:2},1032,["to"])]),e("div",be,[e("div",ve,[ge,_(" "+l(t.formatDate(n.start_date)),1),xe]),n.end_date?(s(),a("div",De,[Ce,_(" "+l(t.formatDate(n.end_date)),1),Ae])):o("",!0)]),f!==t.details.party_affiliations.length-1?(s(),a("hr",Se)):o("",!0)]))),128))]),_:1})])])):o("",!0),t.details?(s(),a("div",Me,[t.details.twitter_user?(s(),a("div",Pe,Be)):o("",!0)])):o("",!0),t.details?(s(),a("div",Le,[t.details.twitter_user?(s(),a("div",Ne,[r(M,{user:t.details.twitter_user},null,8,["user"])])):o("",!0),e("div",Ie,[r(p,null,{default:u(()=>[Ee,t.details.bio.email_address?(s(),a("div",Fe,[Oe,e("span",Te,l(t.details.bio.email_address),1),Ve])):o("",!0),t.details.bio.birth_date?(s(),a("div",je,[We,e("span",null,l(t.formatDate(t.details.bio.birth_date)),1),Ge])):o("",!0),t.details.bio.birth_date&&!t.details.bio.death_date?(s(),a("div",He,[Je,e("span",null,l(t.currentAge),1),Qe])):o("",!0),t.details.bio.death_date?(s(),a("div",Ue,[qe,e("span",null,l(t.formatDate(t.details.bio.death_date)),1),ze])):o("",!0),t.details.bio.death_date&&t.details.bio.birth_date?(s(),a("div",Ke,[Xe,e("span",null,l(t.ageAtDeath),1),Ye])):o("",!0),t.details.bio.wikidata_id?(s(),a("div",Ze,[$e,e("span",null,l(t.details.bio.wikidata_id),1),et])):o("",!0),t.details.bio.turnbull_id?(s(),a("div",tt,[st,e("span",null,l(t.details.bio.turnbull_id),1),at])):o("",!0),t.details.bio.snapchat_user?(s(),a("div",nt,[ot,e("span",null,[r(k,{username:t.details.bio.snapchat_user,platform:"snapchat"},null,8,["username"])]),lt])):o("",!0),t.details.bio.instagram_user?(s(),a("div",rt,[_t,e("span",null,[r(k,{username:t.details.bio.instagram_user,platform:"instagram"},null,8,["username"])]),it])):o("",!0),t.details.bio.facebook_page?(s(),a("div",dt,[ct,e("span",null,[r(k,{username:t.details.bio.facebook_page,platform:"facebook"},null,8,["username"])]),ut])):o("",!0),t.details.bio.wikipedia_page?(s(),a("div",ht,[mt,e("span",null,[r(k,{username:t.details.bio.wikipedia_page,platform:"wikipedia"},null,8,["username"])]),pt])):o("",!0)]),_:1})])])):o("",!0)])}var vt=g(G,[["render",kt]]);export{vt as default};

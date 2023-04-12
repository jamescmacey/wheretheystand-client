import{_ as B}from"./PageHeader.935cdc4f.js";import{a as D,x as U,m as N,A as P,o as l,b as r,c as g,w as y,k as c,e as m,f as e,y as V,z as _,B as F,C as u,D as v,i as f,t as n,F as M,r as O,E as k,L as R,H as A,h as I,v as J,p as E,q as H,s as q}from"./entry.cf8c1731.js";import{_ as z}from"./Spinner.62ccbd15.js";import{f as G}from"./index.dcb4ea67.js";import{p as S,f as j}from"./index.145ce648.js";import"./index.b85c6916.js";const W={async setup(){const d=U().query;var s=1;d.hasOwnProperty("page")&&(s=d.page);const{data:h}=await N(P+"bills/?page="+s+"&per_page=10","$ceS4NSgd1z");return{prefetchData:h}},name:"BillFilter",data(){return{page:1,perPage:10,hasLoadedData:!1,next:!1,bills:[],previous:!1,count:0,isLoading:!1,showDescriptions:!0,filterSettings:{titleContains:"",billTypes:{mem:!0,gov:!0,pri:!0,loc:!0},parliamentaryTerm:"",characteristics:{urgencyUsed:!1,extendedSittingsUsed:!1,submissionsOpen:!1,votingMethod:""},format:{perPage:10,orderBy:"date_modified_desc"}},activeFilter:{titleContains:"",billTypes:{mem:!0,gov:!0,pri:!0,loc:!0},parliamentaryTerm:"",characteristics:{urgencyUsed:!1,extendedSittingsUsed:!1,submissionsOpen:!1,votingMethod:""},format:{perPage:10,orderBy:"date_modified_desc"}}}},computed:{activeString(){return JSON.stringify(this.activeFilter)},userString(){return JSON.stringify(this.filterSettings)},displayBills(){return!this.hasLoadedData&&this.prefetchData?this.prefetchData.results:this.bills},displayCount(){return!this.hasLoadedData&&this.prefetchData?this.prefetchData.count:this.count},displayPage(){return!this.hasLoadedData&&this.prefetchData?this.prefetchData.page:this.page},displayNext(){return!this.hasLoadedData&&this.prefetchData?this.prefetchData.next:this.next},displayPrevious(){return!this.hasLoadedData&&this.prefetchData?this.prefetchData.previous:this.previous}},methods:{async getPage(d){this.isLoading=!0;var s=P+"bills/?",h=await $fetch(s+new URLSearchParams({page:d,per_page:this.activeFilter.format.perPage}),{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({page:d,filter:this.activeFilter})});this.isLoading=!1,this.hasLoadedData=!0,this.bills=h.results,this.count=h.count,h.previous?this.previous=!0:this.previous=!1,h.next?this.next=!0:this.next=!1,this.page=d},applyFilter(){this.activeString!=this.userString&&!this.isLoading&&(this.activeFilter=JSON.parse(JSON.stringify(this.filterSettings)),this.getPage(1))},relativeDate(d){return G(S(d,"yyyy-MM-dd",new Date))+" ago"},formattedDate(d){return j(S(d,"yyyy-MM-dd",new Date),"d.M.yyyy")}}},a=d=>(H("data-v-f455b67d"),d=d(),q(),d),K=a(()=>e("h4",null,"Filter bills",-1)),Q={class:"row mb-2"},X={class:"col-12"},Y=a(()=>e("h5",null,"Refine by title",-1)),Z=a(()=>e("label",{for:"text_filter"},"Title must contain the following:",-1)),$=a(()=>e("small",{class:"text-muted"},"For less strict textual search, you may wish to use the site-wide search function.",-1)),ee=a(()=>e("hr",null,null,-1)),te={class:"row"},se={class:"col-12 col-xl-3"},ie=a(()=>e("h5",null,"Bill types",-1)),ae={class:"form-check"},oe=a(()=>e("label",{class:"form-check-label",for:"check_goverment"}," Government bills ",-1)),le={class:"form-check"},re=a(()=>e("label",{class:"form-check-label",for:"check_members"}," Members' bills ",-1)),ne={class:"form-check"},ce=a(()=>e("label",{class:"form-check-label",for:"check_local"}," Local bills ",-1)),de={class:"form-check"},pe=a(()=>e("label",{class:"form-check-label",for:"check_private"}," Private bills ",-1)),_e=a(()=>e("small",null,[e("strong",null,"OR"),f(": Bills must be any of the selected type to be shown.")],-1)),he={class:"col-12 col-xl-3"},ue=a(()=>e("h5",null,"Temporal characteristics",-1)),ge=a(()=>e("label",{for:"parliament_select"},"Parliamentary term of introduction",-1)),me=a(()=>e("option",{value:"",selected:""},"Any",-1)),fe=a(()=>e("option",{value:"53"},"53rd Parliament",-1)),ye=a(()=>e("option",{value:"52"},"52nd Parliament",-1)),ve=a(()=>e("option",{value:"51"},"51st Parliament",-1)),ke=a(()=>e("option",{value:"50"},"50th Parliament",-1)),be=[me,fe,ye,ve,ke],xe={class:"col-12 col-xl-3"},Pe=a(()=>e("h5",null,"Procedural characteristics",-1)),Se={class:"form-check"},De=a(()=>e("label",{class:"form-check-label",for:"check_urgency"}," Urgency used ",-1)),we={class:"form-check"},Ce=a(()=>e("label",{class:"form-check-label",for:"check_extended"}," Extended sittings used ",-1)),Le={class:"form-check"},Te=a(()=>e("label",{class:"form-check-label",for:"check_submissions_open"}," Open for submissions ",-1)),Be=a(()=>e("label",{for:"voting_method_select",class:"mt-2"},"Voting method",-1)),Ue=a(()=>e("option",{value:"",selected:""},"Any",-1)),Ne=a(()=>e("option",{value:"per"},"Personal voting used",-1)),Ve=a(()=>e("option",{value:"par"},"Party voting used",-1)),Fe=[Ue,Ne,Ve],Me=a(()=>e("small",null,[e("strong",null,"AND"),f(": Bills must meet all of these criteria to be shown.")],-1)),Oe=a(()=>e("hr",null,null,-1)),Re=a(()=>e("h5",null,"Display options",-1)),Ae={class:"row"},Ie={class:"col-12 col-xl-3"},Je=a(()=>e("label",{for:"per_page_select"},"Results per page",-1)),Ee=a(()=>e("option",{value:"10",selected:""},"10",-1)),He=a(()=>e("option",{value:"25"},"25",-1)),qe=a(()=>e("option",{value:"50"},"50",-1)),ze=a(()=>e("option",{value:"100"},"100",-1)),Ge=[Ee,He,qe,ze],je={class:"form-check"},We=a(()=>e("label",{class:"form-check-label",for:"check_show_descriptions"}," Show bill descriptions ",-1)),Ke={class:"col-12 col-xl-3"},Qe=a(()=>e("label",{for:"order_by_select"},"Order by",-1)),Xe=a(()=>e("option",{value:"date_modified_desc",selected:""},"Date modified (newest first)",-1)),Ye=a(()=>e("option",{value:"date_modified_asc"},"Date modified (oldest first)",-1)),Ze=a(()=>e("option",{value:"introduction_date_desc"},"Introduction date (newest first)",-1)),$e=a(()=>e("option",{value:"introduction_date_asc"},"Introduction date (oldest first)",-1)),et=a(()=>e("option",{value:"progress_desc"},"Status (later stages first)",-1)),tt=a(()=>e("option",{value:"progress_asc"},"Status (early stages first)",-1)),st=[Xe,Ye,Ze,$e,et,tt],it=a(()=>e("hr",null,null,-1)),at={class:"row"},ot={class:"col-12"},lt={key:1,disabled:"",class:"btn btn-primary",type:"button",id:"button-addon2"},rt=a(()=>e("span",{id:"results-marker"},null,-1)),nt={key:1},ct=a(()=>e("h4",null,"Results",-1)),dt={key:0},pt={class:"mb-0"},_t={class:"me-1"},ht={key:0,class:"badge bg-primary text-uppercase"},ut={key:1,class:"badge bg-success text-uppercase"},gt={key:2,class:"badge bg-success text-uppercase"},mt={key:3,class:"badge bg-warning text-dark text-uppercase"},ft={key:4,class:"badge bg-danger text-uppercase"},yt={key:5,class:"badge bg-danger text-uppercase"},vt={key:6,class:"badge bg-danger text-uppercase"},kt={key:7,class:"badge bg-info text-uppercase"},bt={key:8,class:"badge bg-warning text-dark text-uppercase"},xt={key:9,class:"badge bg-secondary text-uppercase"},Pt={class:"text-muted text-uppercase"},St={key:0},Dt={key:1,class:"text-muted"},wt={key:2},Ct=["title"],Lt={key:1,"aria-label":"bills_pagination"},Tt={class:"pagination mb-1"},Bt={key:0,class:"page-item"},Ut={class:"page-item active","aria-current":"page"},Nt={key:1,class:"page-item"},Vt=a(()=>e("small",null,"Back to start",-1)),Ft=[Vt],Mt={key:2,"aria-label":"bills_pagination"},Ot={class:"pagination mb-1"},Rt={key:0,class:"page-item"},At={class:"page-item active","aria-current":"page"},It={key:1,class:"page-item"},Jt=a(()=>e("small",null,"Back to start",-1)),Et=[Jt];function Ht(d,s,h,p,o,i){const b=R,w=A,C=z,x=I,L=J,T=E;return l(),r("div",null,[K,p.prefetchData&&p.prefetchData.count&&p.prefetchData.count>0?(l(),g(w,{key:0},{default:y(()=>[p.prefetchData.previous&&p.prefetchData.page==2?(l(),g(b,{key:0,rel:"prev",href:"/bills"})):c("",!0),p.prefetchData.previous&&p.prefetchData.page!=2?(l(),g(b,{key:1,rel:"prev",href:"/bills?page="+(p.prefetchData.page-1)},null,8,["href"])):c("",!0),p.prefetchData.next?(l(),g(b,{key:2,rel:"next",href:"/bills?page="+(p.prefetchData.page+1)},null,8,["href"])):c("",!0)]),_:1})):c("",!0),m(x,null,{default:y(()=>[e("form",{onSubmit:s[14]||(s[14]=V(t=>i.applyFilter(),["prevent"]))},[e("div",Q,[e("div",X,[Y,Z,_(e("input",{"onUpdate:modelValue":s[0]||(s[0]=t=>o.filterSettings.titleContains=t),class:"form-control",type:"input",id:"text_filter"},null,512),[[F,o.filterSettings.titleContains]]),$])]),ee,e("div",te,[e("div",se,[ie,e("div",ae,[_(e("input",{"onUpdate:modelValue":s[1]||(s[1]=t=>o.filterSettings.billTypes.gov=t),class:"form-check-input",type:"checkbox",value:"",id:"check_goverment"},null,512),[[u,o.filterSettings.billTypes.gov]]),oe]),e("div",le,[_(e("input",{"onUpdate:modelValue":s[2]||(s[2]=t=>o.filterSettings.billTypes.mem=t),class:"form-check-input",type:"checkbox",value:"",id:"check_members"},null,512),[[u,o.filterSettings.billTypes.mem]]),re]),e("div",ne,[_(e("input",{"onUpdate:modelValue":s[3]||(s[3]=t=>o.filterSettings.billTypes.loc=t),class:"form-check-input",type:"checkbox",value:"",id:"check_local"},null,512),[[u,o.filterSettings.billTypes.loc]]),ce]),e("div",de,[_(e("input",{"onUpdate:modelValue":s[4]||(s[4]=t=>o.filterSettings.billTypes.pri=t),class:"form-check-input",type:"checkbox",value:"",id:"check_private"},null,512),[[u,o.filterSettings.billTypes.pri]]),pe]),_e]),e("div",he,[ue,ge,_(e("select",{"onUpdate:modelValue":s[5]||(s[5]=t=>o.filterSettings.parliamentaryTerm=t),class:"form-select",id:"parliament_select","aria-label":"-"},be,512),[[v,o.filterSettings.parliamentaryTerm]])]),e("div",xe,[Pe,e("div",Se,[_(e("input",{"onUpdate:modelValue":s[6]||(s[6]=t=>o.filterSettings.characteristics.urgencyUsed=t),class:"form-check-input",type:"checkbox",value:"",id:"check_urgency"},null,512),[[u,o.filterSettings.characteristics.urgencyUsed]]),De]),e("div",we,[_(e("input",{"onUpdate:modelValue":s[7]||(s[7]=t=>o.filterSettings.characteristics.extendedSittingsUsed=t),class:"form-check-input",type:"checkbox",value:"",id:"check_extended"},null,512),[[u,o.filterSettings.characteristics.extendedSittingsUsed]]),Ce]),e("div",Le,[_(e("input",{"onUpdate:modelValue":s[8]||(s[8]=t=>o.filterSettings.characteristics.submissionsOpen=t),class:"form-check-input",type:"checkbox",value:"",id:"check_submissions_open"},null,512),[[u,o.filterSettings.characteristics.submissionsOpen]]),Te]),Be,_(e("select",{"onUpdate:modelValue":s[9]||(s[9]=t=>o.filterSettings.characteristics.votingMethod=t),class:"form-select",id:"voting_method_select","aria-label":"Voting method"},Fe,512),[[v,o.filterSettings.characteristics.votingMethod]]),Me])]),Oe,Re,e("div",Ae,[e("div",Ie,[Je,_(e("select",{"onUpdate:modelValue":s[10]||(s[10]=t=>o.filterSettings.format.perPage=t),class:"form-select",id:"per_page_select","aria-label":"Results per page"},Ge,512),[[v,o.filterSettings.format.perPage]]),e("div",je,[_(e("input",{"onUpdate:modelValue":s[11]||(s[11]=t=>o.showDescriptions=t),class:"form-check-input",type:"checkbox",value:"",id:"check_show_descriptions"},null,512),[[u,o.showDescriptions]]),We])]),e("div",Ke,[Qe,_(e("select",{"onUpdate:modelValue":s[12]||(s[12]=t=>o.filterSettings.format.orderBy=t),class:"form-select",id:"order_by_select","aria-label":"Order by"},st,512),[[v,o.filterSettings.format.orderBy]])])]),it,e("div",at,[e("div",ot,[i.activeString!=i.userString&&!o.isLoading?(l(),r("button",{key:0,onClick:s[13]||(s[13]=t=>i.applyFilter()),class:"btn btn-primary",type:"button",id:"button-addon2"},"Refine selection")):(l(),r("button",lt,"Refine selection")),o.isLoading?(l(),g(C,{key:2,class:"ms-2"})):c("",!0)])])],32)]),_:1}),rt,o.page?(l(),r("div",nt,[ct,f(" "+n(i.displayCount)+" result",1),i.displayCount!=1?(l(),r("span",dt,"s")):c("",!0),f(". "),(l(!0),r(M,null,O(i.displayBills,t=>(l(),g(T,{title:t.name,key:t.id,to:"/bills/"+t.id,class:"bill-link"},{default:y(()=>[m(x,null,{default:y(()=>[e("h6",pt,n(t.name),1),e("small",_t,[t.progress=="inp"?(l(),r("span",ht,n(t.progress_desc),1)):t.progress=="pas"?(l(),r("span",ut,n(t.progress_desc),1)):t.progress=="ena"?(l(),r("span",gt,n(t.progress_desc),1)):t.progress=="dis"?(l(),r("span",mt,n(t.progress_desc),1)):t.progress=="def"?(l(),r("span",ft,n(t.progress_desc),1)):t.progress=="lap"?(l(),r("span",yt,n(t.progress_desc),1)):t.progress=="unx"?(l(),r("span",vt,n(t.progress_desc),1)):t.progress=="div"?(l(),r("span",kt,n(t.progress_desc),1)):t.progress=="wit"?(l(),r("span",bt,n(t.progress_desc),1)):(l(),r("span",xt,n(t.progress_desc),1))]),e("small",Pt,n(t.type_desc),1),t.description&&o.showDescriptions?(l(),r("p",St,n(t.description),1)):o.showDescriptions?(l(),r("p",Dt," No description. ")):c("",!0),o.showDescriptions?c("",!0):(l(),r("br",wt)),e("small",null,[t.date_modified?(l(),r("span",{key:0,title:i.formattedDate(t.date_modified),class:"text-muted"},[m(L,{icon:["fas","history"]}),f(" Last activity "+n(i.relativeDate(t.date_modified)),1)],8,Ct)):c("",!0)])]),_:2},1024)]),_:2},1032,["title","to"]))),128)),!o.isLoading&&!o.hasLoadedData&&p.prefetchData&&i.displayCount>1?(l(),r("nav",Lt,[e("ul",Tt,[e("li",{class:k(["page-item",{disabled:!i.displayPrevious}])},[e("a",{class:"page-link",href:"#results-marker",onClick:s[15]||(s[15]=t=>i.getPage(i.displayPage-1))},"Previous")],2),i.displayPrevious?(l(),r("li",Bt,[e("a",{class:"page-link",href:"#results-marker",onClick:s[16]||(s[16]=t=>i.getPage(i.displayPage-1))},n(i.displayPage-1),1)])):c("",!0),e("li",Ut,[e("a",{class:"page-link",href:"#results-marker",onClick:s[17]||(s[17]=t=>i.getPage(i.displayPage))},n(i.displayPage),1)]),i.displayNext?(l(),r("li",Nt,[e("a",{class:"page-link",href:"#results-marker",onClick:s[18]||(s[18]=t=>i.getPage(i.displayPage+1))},n(i.displayPage+1),1)])):c("",!0),e("li",{class:k(["page-item",{disabled:!i.displayNext}])},[e("a",{class:"page-link",href:"#results-marker",onClick:s[19]||(s[19]=t=>i.getPage(i.displayPage+1))},"Next")],2)]),i.displayPage!=1?(l(),r("a",{key:0,onClick:s[20]||(s[20]=t=>i.getPage(1)),id:"back-to-start",href:"#results-marker"},Ft)):c("",!0)])):c("",!0),!o.isLoading&&o.hasLoadedData&&i.displayCount>1?(l(),r("nav",Mt,[e("ul",Ot,[e("li",{class:k(["page-item",{disabled:!i.displayPrevious}])},[e("a",{class:"page-link",href:"#results-marker",onClick:s[21]||(s[21]=t=>i.getPage(i.displayPage-1))},"Previous")],2),i.displayPrevious?(l(),r("li",Rt,[e("a",{class:"page-link",href:"#results-marker",onClick:s[22]||(s[22]=t=>i.getPage(i.displayPage-1))},n(i.displayPage-1),1)])):c("",!0),e("li",At,[e("a",{class:"page-link",href:"#results-marker",onClick:s[23]||(s[23]=t=>i.getPage(i.displayPage))},n(i.displayPage),1)]),i.displayNext?(l(),r("li",It,[e("a",{class:"page-link",href:"#results-marker",onClick:s[24]||(s[24]=t=>i.getPage(i.displayPage+1))},n(i.displayPage+1),1)])):c("",!0),e("li",{class:k(["page-item",{disabled:!i.displayNext}])},[e("a",{class:"page-link",href:"#results-marker",onClick:s[25]||(s[25]=t=>i.getPage(i.displayPage+1))},"Next")],2)]),i.displayPage!=1?(l(),r("a",{key:0,onClick:s[26]||(s[26]=t=>i.getPage(1)),id:"back-to-start",href:"#results-marker"},Et)):c("",!0)])):c("",!0)])):c("",!0)])}const qt=D(W,[["render",Ht],["__scopeId","data-v-f455b67d"]]),zt={},Gt={class:"container"},jt={class:"row mt-3"},Wt=e("div",{class:"col-12"},[e("h4",null,"Bills are proposed changes to the law, and must each pass through several stages in Parliament before becoming law."),e("p",null,"Before any bill becomes law, there are three main votes it must pass: these are the first, second and third readings. For most bills, there is a chance for members of the public to make submissions at the select committee stage, which happens between the first and second readings."),e("p",null,"After a bill passes its third reading vote, it is granted Royal Assent by the Governor-General and becomes law, subject to any commencement provisions contained within the bill."),e("p",null,"WhereTheyStand contains all bills from the 51st Parliament and later (2014—present). These are imported from Parliament's own website on a regular basis and are automatically linked with voting records and MPs' profiles to make it easier for you to find what you are looking for.")],-1),Kt={class:"col-12"};function Qt(d,s){const h=B,p=qt;return l(),r("div",null,[m(h,{pageTitle:"Bills"}),e("div",Gt,[e("div",jt,[Wt,e("div",Kt,[m(p)])])])])}const ss=D(zt,[["render",Qt]]);export{ss as default};
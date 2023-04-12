import{_ as V}from"./PageHeader.f960e25b.js";import{a as L,x as F,y as O,m as M,A as T,o,b as l,u,c as _,w as k,k as r,e as f,f as e,z as R,B as c,C as A,D as g,E as b,i as y,t as n,F as I,r as J,G as P,L as E,H as G,h as H,v as j,p as q,q as z,s as W}from"./entry.fe9423a6.js";import{_ as K}from"./Spinner.5967ecad.js";import{f as Q}from"./index.dcb4ea67.js";import{p as C,f as X}from"./index.145ce648.js";import"./index.b85c6916.js";const a=d=>(z("data-v-304580c2"),d=d(),W(),d),Y=a(()=>e("h4",null,"Filter bills",-1)),Z={class:"row mb-2"},x={class:"col-12"},ee=a(()=>e("h5",null,"Refine by title",-1)),se=a(()=>e("label",{for:"text_filter"},"Title must contain the following:",-1)),te=a(()=>e("small",{class:"text-muted"},"For less strict textual search, you may wish to use the site-wide search function.",-1)),ie=a(()=>e("hr",null,null,-1)),ae={class:"row"},oe={class:"col-12 col-xl-3"},le=a(()=>e("h5",null,"Bill types",-1)),ne={class:"form-check"},re=a(()=>e("label",{class:"form-check-label",for:"check_goverment"}," Government bills ",-1)),de={class:"form-check"},ce=a(()=>e("label",{class:"form-check-label",for:"check_members"}," Members' bills ",-1)),pe={class:"form-check"},ue=a(()=>e("label",{class:"form-check-label",for:"check_local"}," Local bills ",-1)),he={class:"form-check"},ge=a(()=>e("label",{class:"form-check-label",for:"check_private"}," Private bills ",-1)),me=a(()=>e("small",null,[e("strong",null,"OR"),y(": Bills must be any of the selected type to be shown.")],-1)),_e={class:"col-12 col-xl-3"},fe=a(()=>e("h5",null,"Temporal characteristics",-1)),ye=a(()=>e("label",{for:"parliament_select"},"Parliamentary term of introduction",-1)),ve=a(()=>e("option",{value:"",selected:""},"Any",-1)),ke=a(()=>e("option",{value:"53"},"53rd Parliament",-1)),be=a(()=>e("option",{value:"52"},"52nd Parliament",-1)),Pe=a(()=>e("option",{value:"51"},"51st Parliament",-1)),Se=a(()=>e("option",{value:"50"},"50th Parliament",-1)),we=[ve,ke,be,Pe,Se],De={class:"col-12 col-xl-3"},Ce=a(()=>e("h5",null,"Procedural characteristics",-1)),Le={class:"form-check"},Te=a(()=>e("label",{class:"form-check-label",for:"check_urgency"}," Urgency used ",-1)),Be={class:"form-check"},Ue=a(()=>e("label",{class:"form-check-label",for:"check_extended"}," Extended sittings used ",-1)),$e={class:"form-check"},Ne=a(()=>e("label",{class:"form-check-label",for:"check_submissions_open"}," Open for submissions ",-1)),Ve=a(()=>e("label",{for:"voting_method_select",class:"mt-2"},"Voting method",-1)),Fe=a(()=>e("option",{value:"",selected:""},"Any",-1)),Oe=a(()=>e("option",{value:"per"},"Personal voting used",-1)),Me=a(()=>e("option",{value:"par"},"Party voting used",-1)),Re=[Fe,Oe,Me],Ae=a(()=>e("small",null,[e("strong",null,"AND"),y(": Bills must meet all of these criteria to be shown.")],-1)),Ie=a(()=>e("hr",null,null,-1)),Je=a(()=>e("h5",null,"Display options",-1)),Ee={class:"row"},Ge={class:"col-12 col-xl-3"},He=a(()=>e("label",{for:"per_page_select"},"Results per page",-1)),je=a(()=>e("option",{value:"10",selected:""},"10",-1)),qe=a(()=>e("option",{value:"25"},"25",-1)),ze=a(()=>e("option",{value:"50"},"50",-1)),We=a(()=>e("option",{value:"100"},"100",-1)),Ke=[je,qe,ze,We],Qe={class:"form-check"},Xe=a(()=>e("label",{class:"form-check-label",for:"check_show_descriptions"}," Show bill descriptions ",-1)),Ye={class:"col-12 col-xl-3"},Ze=a(()=>e("label",{for:"order_by_select"},"Order by",-1)),xe=a(()=>e("option",{value:"date_modified_desc",selected:""},"Date modified (newest first)",-1)),es=a(()=>e("option",{value:"date_modified_asc"},"Date modified (oldest first)",-1)),ss=a(()=>e("option",{value:"introduction_date_desc"},"Introduction date (newest first)",-1)),ts=a(()=>e("option",{value:"introduction_date_asc"},"Introduction date (oldest first)",-1)),is=a(()=>e("option",{value:"progress_desc"},"Status (later stages first)",-1)),as=a(()=>e("option",{value:"progress_asc"},"Status (early stages first)",-1)),os=[xe,es,ss,ts,is,as],ls=a(()=>e("hr",null,null,-1)),ns={class:"row"},rs={class:"col-12"},ds={key:1,disabled:"",class:"btn btn-primary",type:"button",id:"button-addon2"},cs=a(()=>e("span",{id:"results-marker"},null,-1)),ps={key:1},us=a(()=>e("h4",null,"Results",-1)),hs={key:0},gs={class:"mb-0"},ms={class:"me-1"},_s={key:0,class:"badge bg-primary text-uppercase"},fs={key:1,class:"badge bg-success text-uppercase"},ys={key:2,class:"badge bg-success text-uppercase"},vs={key:3,class:"badge bg-warning text-dark text-uppercase"},ks={key:4,class:"badge bg-danger text-uppercase"},bs={key:5,class:"badge bg-danger text-uppercase"},Ps={key:6,class:"badge bg-danger text-uppercase"},Ss={key:7,class:"badge bg-info text-uppercase"},ws={key:8,class:"badge bg-warning text-dark text-uppercase"},Ds={key:9,class:"badge bg-secondary text-uppercase"},Cs={class:"text-muted text-uppercase"},Ls={key:0},Ts={key:1,class:"text-muted"},Bs={key:2},Us=["title"],$s={key:1,"aria-label":"bills_pagination"},Ns={class:"pagination mb-1"},Vs={key:0,class:"page-item"},Fs={class:"page-item active","aria-current":"page"},Os={key:1,class:"page-item"},Ms=a(()=>e("small",null,"Back to start",-1)),Rs=[Ms],As={key:2,"aria-label":"bills_pagination"},Is={class:"pagination mb-1"},Js={key:0,class:"page-item"},Es={class:"page-item active","aria-current":"page"},Gs={key:1,class:"page-item"},Hs=a(()=>e("small",null,"Back to start",-1)),js=[Hs],qs={name:"BillFilter",data(){return{page:1,perPage:10,hasLoadedData:!1,next:!1,bills:[],previous:!1,count:0,isLoading:!1,showDescriptions:!0,filterSettings:{titleContains:"",billTypes:{mem:!0,gov:!0,pri:!0,loc:!0},parliamentaryTerm:"",characteristics:{urgencyUsed:!1,extendedSittingsUsed:!1,submissionsOpen:!1,votingMethod:""},format:{perPage:10,orderBy:"date_modified_desc"}},activeFilter:{titleContains:"",billTypes:{mem:!0,gov:!0,pri:!0,loc:!0},parliamentaryTerm:"",characteristics:{urgencyUsed:!1,extendedSittingsUsed:!1,submissionsOpen:!1,votingMethod:""},format:{perPage:10,orderBy:"date_modified_desc"}}}},computed:{activeString(){return JSON.stringify(this.activeFilter)},userString(){return JSON.stringify(this.filterSettings)},displayBills(){return!this.hasLoadedData&&this.prefetchData?this.prefetchData.results:this.bills},displayCount(){return!this.hasLoadedData&&this.prefetchData?this.prefetchData.count:this.count},displayPage(){return!this.hasLoadedData&&this.prefetchData?this.prefetchData.page:this.page},displayNext(){return!this.hasLoadedData&&this.prefetchData?this.prefetchData.next:this.next},displayPrevious(){return!this.hasLoadedData&&this.prefetchData?this.prefetchData.previous:this.previous}},methods:{async getPage(d){this.isLoading=!0;var m=T+"bills/?",h=await $fetch(m+new URLSearchParams({page:d,per_page:this.activeFilter.format.perPage}),{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({page:d,filter:this.activeFilter})});this.isLoading=!1,this.hasLoadedData=!0,this.bills=h.results,this.count=h.count,h.previous?this.previous=!0:this.previous=!1,h.next?this.next=!0:this.next=!1,this.page=d},applyFilter(){this.activeString!=this.userString&&!this.isLoading&&(this.activeFilter=JSON.parse(JSON.stringify(this.filterSettings)),this.getPage(1))},relativeDate(d){return Q(C(d,"yyyy-MM-dd",new Date))+" ago"},formattedDate(d){return X(C(d,"yyyy-MM-dd",new Date),"d.M.yyyy")}}},zs=Object.assign(qs,{async setup(d){let m,h;const v=F().query;var w=1;v.hasOwnProperty("page")&&(w=v.page);const{data:p}=([m,h]=O(()=>M(T+"bills/?page="+w+"&per_page=10","$ceS4NSgd1z")),m=await m,h(),m);return(s,i)=>{const S=E,B=G,U=K,D=H,$=j,N=q;return o(),l("div",null,[Y,u(p)&&u(p).count&&u(p).count>0?(o(),_(B,{key:0},{default:k(()=>[u(p).previous&&u(p).page==2?(o(),_(S,{key:0,rel:"prev",href:"/bills"})):r("",!0),u(p).previous&&u(p).page!=2?(o(),_(S,{key:1,rel:"prev",href:"/bills?page="+(u(p).page-1)},null,8,["href"])):r("",!0),u(p).next?(o(),_(S,{key:2,rel:"next",href:"/bills?page="+(u(p).page+1)},null,8,["href"])):r("",!0)]),_:1})):r("",!0),f(D,null,{default:k(()=>[e("form",{onSubmit:i[14]||(i[14]=R(t=>s.applyFilter(),["prevent"]))},[e("div",Z,[e("div",x,[ee,se,c(e("input",{"onUpdate:modelValue":i[0]||(i[0]=t=>s.filterSettings.titleContains=t),class:"form-control",type:"input",id:"text_filter"},null,512),[[A,s.filterSettings.titleContains]]),te])]),ie,e("div",ae,[e("div",oe,[le,e("div",ne,[c(e("input",{"onUpdate:modelValue":i[1]||(i[1]=t=>s.filterSettings.billTypes.gov=t),class:"form-check-input",type:"checkbox",value:"",id:"check_goverment"},null,512),[[g,s.filterSettings.billTypes.gov]]),re]),e("div",de,[c(e("input",{"onUpdate:modelValue":i[2]||(i[2]=t=>s.filterSettings.billTypes.mem=t),class:"form-check-input",type:"checkbox",value:"",id:"check_members"},null,512),[[g,s.filterSettings.billTypes.mem]]),ce]),e("div",pe,[c(e("input",{"onUpdate:modelValue":i[3]||(i[3]=t=>s.filterSettings.billTypes.loc=t),class:"form-check-input",type:"checkbox",value:"",id:"check_local"},null,512),[[g,s.filterSettings.billTypes.loc]]),ue]),e("div",he,[c(e("input",{"onUpdate:modelValue":i[4]||(i[4]=t=>s.filterSettings.billTypes.pri=t),class:"form-check-input",type:"checkbox",value:"",id:"check_private"},null,512),[[g,s.filterSettings.billTypes.pri]]),ge]),me]),e("div",_e,[fe,ye,c(e("select",{"onUpdate:modelValue":i[5]||(i[5]=t=>s.filterSettings.parliamentaryTerm=t),class:"form-select",id:"parliament_select","aria-label":"-"},we,512),[[b,s.filterSettings.parliamentaryTerm]])]),e("div",De,[Ce,e("div",Le,[c(e("input",{"onUpdate:modelValue":i[6]||(i[6]=t=>s.filterSettings.characteristics.urgencyUsed=t),class:"form-check-input",type:"checkbox",value:"",id:"check_urgency"},null,512),[[g,s.filterSettings.characteristics.urgencyUsed]]),Te]),e("div",Be,[c(e("input",{"onUpdate:modelValue":i[7]||(i[7]=t=>s.filterSettings.characteristics.extendedSittingsUsed=t),class:"form-check-input",type:"checkbox",value:"",id:"check_extended"},null,512),[[g,s.filterSettings.characteristics.extendedSittingsUsed]]),Ue]),e("div",$e,[c(e("input",{"onUpdate:modelValue":i[8]||(i[8]=t=>s.filterSettings.characteristics.submissionsOpen=t),class:"form-check-input",type:"checkbox",value:"",id:"check_submissions_open"},null,512),[[g,s.filterSettings.characteristics.submissionsOpen]]),Ne]),Ve,c(e("select",{"onUpdate:modelValue":i[9]||(i[9]=t=>s.filterSettings.characteristics.votingMethod=t),class:"form-select",id:"voting_method_select","aria-label":"Voting method"},Re,512),[[b,s.filterSettings.characteristics.votingMethod]]),Ae])]),Ie,Je,e("div",Ee,[e("div",Ge,[He,c(e("select",{"onUpdate:modelValue":i[10]||(i[10]=t=>s.filterSettings.format.perPage=t),class:"form-select",id:"per_page_select","aria-label":"Results per page"},Ke,512),[[b,s.filterSettings.format.perPage]]),e("div",Qe,[c(e("input",{"onUpdate:modelValue":i[11]||(i[11]=t=>s.showDescriptions=t),class:"form-check-input",type:"checkbox",value:"",id:"check_show_descriptions"},null,512),[[g,s.showDescriptions]]),Xe])]),e("div",Ye,[Ze,c(e("select",{"onUpdate:modelValue":i[12]||(i[12]=t=>s.filterSettings.format.orderBy=t),class:"form-select",id:"order_by_select","aria-label":"Order by"},os,512),[[b,s.filterSettings.format.orderBy]])])]),ls,e("div",ns,[e("div",rs,[s.activeString!=s.userString&&!s.isLoading?(o(),l("button",{key:0,onClick:i[13]||(i[13]=t=>s.applyFilter()),class:"btn btn-primary",type:"button",id:"button-addon2"},"Refine selection")):(o(),l("button",ds,"Refine selection")),s.isLoading?(o(),_(U,{key:2,class:"ms-2"})):r("",!0)])])],32)]),_:1}),cs,s.page?(o(),l("div",ps,[us,y(" "+n(s.displayCount)+" result",1),s.displayCount!=1?(o(),l("span",hs,"s")):r("",!0),y(". "),(o(!0),l(I,null,J(s.displayBills,t=>(o(),_(N,{title:t.name,key:t.id,to:"/bills/"+t.id,class:"bill-link"},{default:k(()=>[f(D,null,{default:k(()=>[e("h6",gs,n(t.name),1),e("small",ms,[t.progress=="inp"?(o(),l("span",_s,n(t.progress_desc),1)):t.progress=="pas"?(o(),l("span",fs,n(t.progress_desc),1)):t.progress=="ena"?(o(),l("span",ys,n(t.progress_desc),1)):t.progress=="dis"?(o(),l("span",vs,n(t.progress_desc),1)):t.progress=="def"?(o(),l("span",ks,n(t.progress_desc),1)):t.progress=="lap"?(o(),l("span",bs,n(t.progress_desc),1)):t.progress=="unx"?(o(),l("span",Ps,n(t.progress_desc),1)):t.progress=="div"?(o(),l("span",Ss,n(t.progress_desc),1)):t.progress=="wit"?(o(),l("span",ws,n(t.progress_desc),1)):(o(),l("span",Ds,n(t.progress_desc),1))]),e("small",Cs,n(t.type_desc),1),t.description&&s.showDescriptions?(o(),l("p",Ls,n(t.description),1)):s.showDescriptions?(o(),l("p",Ts," No description. ")):r("",!0),s.showDescriptions?r("",!0):(o(),l("br",Bs)),e("small",null,[t.date_modified?(o(),l("span",{key:0,title:s.formattedDate(t.date_modified),class:"text-muted"},[f($,{icon:["fas","history"]}),y(" Last activity "+n(s.relativeDate(t.date_modified)),1)],8,Us)):r("",!0)])]),_:2},1024)]),_:2},1032,["title","to"]))),128)),!s.isLoading&&!s.hasLoadedData&&u(p)&&s.displayCount>1?(o(),l("nav",$s,[e("ul",Ns,[e("li",{class:P(["page-item",{disabled:!s.displayPrevious}])},[e("a",{class:"page-link",href:"#results-marker",onClick:i[15]||(i[15]=t=>s.getPage(s.displayPage-1))},"Previous")],2),s.displayPrevious?(o(),l("li",Vs,[e("a",{class:"page-link",href:"#results-marker",onClick:i[16]||(i[16]=t=>s.getPage(s.displayPage-1))},n(s.displayPage-1),1)])):r("",!0),e("li",Fs,[e("a",{class:"page-link",href:"#results-marker",onClick:i[17]||(i[17]=t=>s.getPage(s.displayPage))},n(s.displayPage),1)]),s.displayNext?(o(),l("li",Os,[e("a",{class:"page-link",href:"#results-marker",onClick:i[18]||(i[18]=t=>s.getPage(s.displayPage+1))},n(s.displayPage+1),1)])):r("",!0),e("li",{class:P(["page-item",{disabled:!s.displayNext}])},[e("a",{class:"page-link",href:"#results-marker",onClick:i[19]||(i[19]=t=>s.getPage(s.displayPage+1))},"Next")],2)]),s.displayPage!=1?(o(),l("a",{key:0,onClick:i[20]||(i[20]=t=>s.getPage(1)),id:"back-to-start",href:"#results-marker"},Rs)):r("",!0)])):r("",!0),!s.isLoading&&s.hasLoadedData&&s.displayCount>1?(o(),l("nav",As,[e("ul",Is,[e("li",{class:P(["page-item",{disabled:!s.displayPrevious}])},[e("a",{class:"page-link",href:"#results-marker",onClick:i[21]||(i[21]=t=>s.getPage(s.displayPage-1))},"Previous")],2),s.displayPrevious?(o(),l("li",Js,[e("a",{class:"page-link",href:"#results-marker",onClick:i[22]||(i[22]=t=>s.getPage(s.displayPage-1))},n(s.displayPage-1),1)])):r("",!0),e("li",Es,[e("a",{class:"page-link",href:"#results-marker",onClick:i[23]||(i[23]=t=>s.getPage(s.displayPage))},n(s.displayPage),1)]),s.displayNext?(o(),l("li",Gs,[e("a",{class:"page-link",href:"#results-marker",onClick:i[24]||(i[24]=t=>s.getPage(s.displayPage+1))},n(s.displayPage+1),1)])):r("",!0),e("li",{class:P(["page-item",{disabled:!s.displayNext}])},[e("a",{class:"page-link",href:"#results-marker",onClick:i[25]||(i[25]=t=>s.getPage(s.displayPage+1))},"Next")],2)]),s.displayPage!=1?(o(),l("a",{key:0,onClick:i[26]||(i[26]=t=>s.getPage(1)),id:"back-to-start",href:"#results-marker"},js)):r("",!0)])):r("",!0)])):r("",!0)])}}}),Ws=L(zs,[["__scopeId","data-v-304580c2"]]),Ks={},Qs={class:"container"},Xs={class:"row mt-3"},Ys=e("div",{class:"col-12"},[e("h4",null,"Bills are proposed changes to the law, and must each pass through several stages in Parliament before becoming law."),e("p",null,"Before any bill becomes law, there are three main votes it must pass: these are the first, second and third readings. For most bills, there is a chance for members of the public to make submissions at the select committee stage, which happens between the first and second readings."),e("p",null,"After a bill passes its third reading vote, it is granted Royal Assent by the Governor-General and becomes law, subject to any commencement provisions contained within the bill."),e("p",null,"WhereTheyStand contains all bills from the 51st Parliament and later (2014—present). These are imported from Parliament's own website on a regular basis and are automatically linked with voting records and MPs' profiles to make it easier for you to find what you are looking for.")],-1),Zs={class:"col-12"};function xs(d,m){const h=V,v=Ws;return o(),l("div",null,[f(h,{pageTitle:"Bills"}),e("div",Qs,[e("div",Xs,[Ys,e("div",Zs,[f(v)])])])])}const lt=L(Ks,[["render",xs]]);export{lt as default};

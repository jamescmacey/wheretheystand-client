import{_ as x}from"./ExternalLinkButton-793aa0d9.mjs";import{_ as v,Q as z,g as D,p as P,o as t,c as n,b as e,t as r,a as d,l as f,w as c,h as o,d as M,F as h,i as m,e as p,f as S}from"./entry-6994fce1.mjs";const B={name:"PersonInterests",setup(){return{peopleStore:z()}},methods:{interestsForType(a){return this.interests.interests.filter(_=>_.type===a.toString())},interestTypeDescription(a){return{1:"Company directorships and controlling interests",2:"Other companies and business entities",3:"Employment",4:"Beneficial interests in, and trusteeships of, trusts",5:"Organisations and trusts seeking Government funding",6:"Real property",7:"Retirement (superannuation) schemes",8:"Investment schemes",9:"Debtors (those who owe "+this.person.display_name+" money)",10:"Creditors (those who "+this.person.display_name+" owes money to)",11:"Overseas travel costs",12:"Gifts",13:"Discharged debts",14:"Payments for activities"}[a]}},created(){this.peopleStore.fetchInterests(this.$route.params.id)},computed:{person(){return this.peopleStore.byIdentifier(this.$route.params.id)},interests(){return this.peopleStore.interestsByIdentifier(this.$route.params.id)},formattedReportDate(){return D(P(this.interests.filing_date,"yyyy-MM-dd",new Date),"d MMMM yyyy")},hasChangedDebt(){return this.interests?this.interests.interests.filter(a=>a.description.endsWith("*")):!1}}},T={class:"container"},C={class:"row mt-3"},F={class:"col-12"},I=e("h4",null,"Financial interests",-1),N=e("p",null,"Each year, Members of Parliament are required to declare their financial interests, along with other specified interests.",-1),V={key:0},E={class:"text-muted"},R={key:0},L={key:0},O=e("br",null,null,-1),G=p("View on NZBN Registry"),W=e("p",null,"WhereTheyStand doesn't have interests for recently elected MPs or MPs who left Parliament before the 52nd Parliament opened.",-1),q={key:2,class:"text-muted"},A={key:3,class:"text-muted"};function Q(a,_,Z,j,H,s){const u=x,w=S,y=M;return t(),n("div",T,[e("div",C,[e("div",F,[I,N,e("p",null,"This page shows all the interests that "+r(s.person.display_name)+" declared when the register was last compiled. From time to time, amendments are also made and are incorporated into the list you see here.",1),d(u,{link:"https://www.parliament.nz/en/mps-and-electorates/mps-financial-interests/",text:"Learn more on the Parliament website"}),s.interests&&s.interests!={}?(t(),f(y,{key:0},{default:c(()=>[e("h5",null,"Interests for "+r(s.person.display_name)+" as at "+r(s.formattedReportDate),1),(t(),n(h,null,m(12,l=>e("div",{key:l},[s.interestsForType(l).length?(t(),n("div",V,[e("h6",null,[e("span",E,r(l),1),p(" "+r(s.interestTypeDescription(l)),1)]),e("ul",null,[(t(!0),n(h,null,m(s.interestsForType(l),(i,b)=>(t(),n("li",{key:b},[p(r(i.description)+" ",1),i.nzbn_match.nzbn?(t(),n("span",R,[i.nzbn_match.entity_classifications_descs?(t(),n("br",L)):o("",!0),i.nzbn_match.entity_classifications_descs?(t(!0),n(h,{key:1},m(i.nzbn_match.entity_classifications_descs,(g,k)=>(t(),n("span",{class:"text-muted",key:k},r(g),1))),128)):o("",!0),O,e("small",null,[d(w,{link:"https://www.nzbn.govt.nz/mynzbn/nzbndetails/"+i.nzbn_match.nzbn},{default:c(()=>[G]),_:2},1032,["link"])])])):o("",!0)]))),128))])])):o("",!0)])),64))]),_:1})):(t(),f(y,{key:1,missing:!0,class:"text-center"},{default:c(()=>[e("p",null,[e("strong",null,"No interests were found for "+r(s.person.display_name),1)]),W,d(u,{link:"https://www.parliament.nz/en/mps-and-electorates/mps-financial-interests/",text:"View historic or new registers of financial interests on the Parliament website"})]),_:1})),s.hasChangedDebt?(t(),n("p",q,"An asterisk (*) denotes that the interest rate payable in relation to the debt is less than the normal market interest rate that applied at the time the debt was incurred, or, if the terms of the debt have been amended, at the time of that amendment.")):o("",!0),s.interests&&s.interests!={}?(t(),n("p",A,"Due to the original formatting of this material, some interests might exist on the same line.")):o("",!0)])])])}var U=v(B,[["render",Q]]);export{U as default};

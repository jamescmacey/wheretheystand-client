import{_ as c}from"./PageHeader-953c8854.mjs";import{_ as i,Q as l,r,o as m,c as d,a as e,w as u,h as _}from"./entry-6994fce1.mjs";const g={name:"Person",setup(){return{peopleStore:l()}},created(){this.peopleStore.fetch(this.$route.params.id).then(function(o){})},computed:{links(){return[{to:"/people/"+this.$route.params.id,name:"Overview"},{to:"/people/"+this.$route.params.id+"/details",name:"Details"},{to:"/people/"+this.$route.params.id+"/interests",name:"Interests"},{to:"/people/"+this.$route.params.id+"/expenses",name:"Expenses"}]},person(){return this.peopleStore.byIdentifier(this.$route.params.id)}}},h={key:0,id:"person-view"};function y(o,w,f,S,x,t){const n=r("Meta"),a=r("Head"),s=c,p=r("NuxtPage");return t.person?(m(),d("div",h,[e(a,null,{default:u(()=>[e(n,{name:"twitter:card",content:"summary"}),e(n,{name:"twitter:image",content:t.person.image},null,8,["content"]),e(n,{name:"twitter:image:alt",content:t.person.display_name},null,8,["content"]),e(n,{property:"og:image:alt",content:t.person.display_name},null,8,["content"]),e(n,{property:"og:image",content:t.person.image},null,8,["content"]),e(n,{name:"twitter:card",content:"summary"}),e(n,{name:"twitter:site",content:"@wherestandnz"}),e(n,{name:"twitter:title",content:t.person.display_name+" - WhereTheyStand"},null,8,["content"]),e(n,{name:"twitter:description",content:t.person.description},null,8,["content"]),e(n,{property:"og:site_name",content:"WhereTheyStand"}),e(n,{property:"og:locale",content:"en_NZ"}),e(n,{property:"og:description",content:t.person.description},null,8,["content"]),e(n,{property:"og:title",content:t.person.display_name+" - WhereTheyStand"},null,8,["content"])]),_:1}),e(s,{pageTitle:t.person.display_name,pageSubtitle:t.person.description,image:t.person.image,colour:t.person.colour,pageLinks:t.links},null,8,["pageTitle","pageSubtitle","image","colour","pageLinks"]),e(p,{person:t.person},null,8,["person"])])):_("",!0)}var N=i(g,[["render",y]]);export{N as default};

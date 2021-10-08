import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";
import { checkLogin } from "../mixins/utils";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/about",
    name: "About",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/About.vue"),
  },
  {
    path: "/recipes",
    name: "Recipes",
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/Recipes.vue"),
    meta: { requiredAuth: true },
  },
  {
    path: "/recipes/:recipeId",
    name: "Contents",
    component: () => import("../views/Contents.vue"),
    meta: { requiredAuth: true },
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

router.beforeEach((to, from, next) => {
  if (to.matched.some((record) => record.meta.requiredAuth)) {
    // requiredAuth属性がtrueのルートに遷移する前に呼び出される.
    checkLogin() // 認証済みのユーザが存在するかどうかをチェックする関数
      .then(() => {
        next();
      })
      .catch((error) => {
        console.log("auth failed");
        console.log(error);
        alert("ログインに失敗しました。ホーム画面に戻ります。");
        localStorage.removeItem("recipe_app_access_token");
        next({
          path: "/",
          query: { redirect: to.fullPath },
        });
      });
  }
  next();
});

export default router;

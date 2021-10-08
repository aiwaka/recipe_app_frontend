import axios from "axios";
import router from "../router";

export const server_url = process.env.VUE_APP_EXTERNAL_SERVER_URL;

export const authorizedHeader = function (props_obj = {}) {
  // アクセストークンを含めたヘッダーオブジェクトを返す. ないならないでOK.
  return Object.assign(
    {
      "Content-Type": "application/json",
      Authorization: `bearer ${localStorage.getItem(
        "recipe_app_access_token"
      )}`,
    },
    props_obj
  );
};

export const checkLogin = async function () {
  console.log("checking login status");
  const headers = authorizedHeader();
  const result = await axios
    .post(server_url + "/check_login", {}, { headers })
    .then((response) => response)
    .catch((err) => err.response);
  if (result.status === 200) {
    return;
  } else {
    throw result;
  }
};

export const pushToLoginPage = function (message) {
  alert(
    "ログインに失敗しました。\nエラーメッセージ：" +
      message +
      "\nログイン画面に戻ります。"
  );
  localStorage.removeItem("recipe_app_access_token");
  router.push({ path: "/" });
};

export default {
  methods: {
    authorizedHeader(props_obj = {}) {
      // アクセストークンを含めたヘッダーオブジェクトを返す. ないならないでOK.
      return Object.assign(
        {
          "Content-Type": "application/json",
          Authorization: `bearer ${localStorage.getItem(
            "recipe_app_access_token"
          )}`,
        },
        props_obj
      );
    },
  },
};

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
    .get(server_url + "/login", { headers })
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

export const standardAccessToAPI = async function (
  axiosPromise,
  successMethod
) {
  // axios.post(...)などのPromiseオブジェクトを受け取り,
  // 成功した場合はsuccessMethodを引数resultで実行,
  // 失敗している場合はコンソールに表示する.
  const result = await axiosPromise
    .then((response) => response)
    .catch((err) => err.response);
  if (result.status == 200) {
    successMethod(result);
  } else {
    if ("message" in result.data) {
      pushToLoginPage(result.data.message);
    } else {
      console.log(result);
    }
  }
};

// export default {
//   methods: {
//     authorizedHeader(props_obj = {}) {
//       // アクセストークンを含めたヘッダーオブジェクトを返す. ないならないでOK.
//       return Object.assign(
//         {
//           "Content-Type": "application/json",
//           Authorization: `bearer ${localStorage.getItem(
//             "recipe_app_access_token"
//           )}`,
//         },
//         props_obj
//       );
//     },
//   },
// };

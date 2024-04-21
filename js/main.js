/**
 * フォーカストラップ<br>
 * ※キーボードフォーカス移動を基準要素内でループさせる
 *
 * @param {jQuery} d 基準要素
 */
const focusTrap = function (d = $(document)) {
	d = $(d);
	d.on("keydown", ":focusable", (e) => {
		// [Tab]または[Enter]押下時のみ処理する
		if (e.key !== "Tab" && e.key !== "Enter") return;

		/*
		 * キーボードフォーカス移動対象の要素を取得
		 */
		// キーボードフォーカス移動可能な要素をtabindexでソートして取得
		let tabbable = d.find(":tabbable")
			.sort((a, b) => a.tabIndex - b.tabIndex);
		// ラジオボタンは選択済(未選択時は一つ目)のみキーボードフォーカス移動対象とする
		tabbable = tabbable.filter((_, elm) => {
			if (elm.type !== "radio" || !elm.name) {
				return true;
			}
			const radioGrp = tabbable.filter(`[name='${elm.name}']`);
			const checked = radioGrp.filter(":checked");
			if (checked.length) {
				return checked.is(elm);
			}
			return radioGrp.first().is(elm);
		});

		// 現在フォーカス中の要素を取得
		const focusElm = $(e.target);

		/*
		 * フォーカス移動先を判定
		 */
		let nextElm = null;
		const firstElm = tabbable.first();
		const lastElm = tabbable.last();

		// [Tab]の場合 or 現在フォーカス中の要素がキーボードフォーカス移動可能な要素ではない場合(tabindex="-1"など)
		if (e.key === "Tab" || !tabbable.filter(focusElm).length) {
			// ブラウザ標準と似た挙動になるよう補正(要素の定義順に移動)
			const focusable = d.find(":focusable");
			let idx = focusable.index(focusElm);
			if (!e.shiftKey) {
				const lastIdx = focusable.index(lastElm);
				while (idx < lastIdx) {
					const target = focusable.eq(++idx);
					if (tabbable.filter(target).length) {
						nextElm = target;
						break;
					}
				}
				if (!nextElm) {
					nextElm = firstElm;
				}
			}
			// [Shift]押下時は逆順に移動
			else {
				const firstIdx = focusable.index(firstElm);
				while (idx >= firstIdx) {
					const target = focusable.eq(--idx);
					if (tabbable.filter(target).length) {
						nextElm = target;
						break;
					}
				}
				if (!nextElm) {
					nextElm = lastElm;
				}
			}
		} else {
			// 最後の要素にフォーカスしている場合は最初の要素へ
			if (!e.shiftKey && focusElm.is(lastElm)) {
				nextElm = firstElm;
			}
			// [Shift]押下時で最初の要素にフォーカスしている場合は最後の要素へ
			if (e.shiftKey && focusElm.is(firstElm)) {
				nextElm = lastElm;
			}
			// 上記以外は次([Shift]押下時は前)の要素へ
			if (!nextElm) {
				nextElm = tabbable.eq(tabbable.index(focusElm) + (e.shiftKey ? -1 : 1));
			}
		}

		// 移動先要素にフォーカスして入力値を全選択
		nextElm.focus().select();
		return false;
	});
};

// イベント登録
focusTrap();

// ダイアログ定義
const dialog = $("#dialog").dialog({
	title: "テストダイアログ",
	autoOpen: false,
	modal: true,
	width: $("body").width() * 0.9,
});
// ダイアログオープンイベント登録
$("#open-dialog").click(() => {
	dialog.html($("#template").html());
	focusTrap(dialog.parent());
	dialog.dialog("open");
});

// 確認用に属性値を表示しておく
$(":focusable").each(function () {
	$(this).val(`${$(this).val()}(tab-index: ${this.tabIndex})`);
	$(this).text(`${$(this).text()}(tab-index: ${this.tabIndex})`);
});
// 確認用tabindex除去ボタン
$("#remove-tabindex").click(() => {
	$("[tabindex]").removeAttr("tabindex");
});

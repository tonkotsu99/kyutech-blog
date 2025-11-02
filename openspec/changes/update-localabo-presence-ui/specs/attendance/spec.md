## ADDED Requirements

### Requirement: Localabo Presence Visualization

Localabo 在室状況画面 SHALL 表示対象メンバーを `IN_LAB` / `ON_CAMPUS` / `OFF_CAMPUS` の 3 セクションに分類し、それぞれの人数と一覧を提示する。

#### Scenario: On-campus section is rendered

- **WHEN** `ON_CAMPUS` の在室ステータスを持つメンバーが存在する
- **THEN** Localabo 画面に「学内」セクションが表示され、そのメンバーの名前・学年などが一覧表示される

#### Scenario: Counts reflect underlying data

- **WHEN** API が各ステータスに該当するメンバーを返す
- **THEN** それぞれのセクション見出しには該当メンバー数が表示され、リストは最新データと一致する

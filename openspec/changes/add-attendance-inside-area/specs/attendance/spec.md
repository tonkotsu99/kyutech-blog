## ADDED Requirements

### Requirement: Presence Status Management

システム SHALL ユーザープロフィールに `IN_LAB` / `ON_CAMPUS` / `OFF_CAMPUS` の 3 値で現在の在室ステータスを保持し、一貫した判定を提供する。

#### Scenario: Default state for new profiles

- **WHEN** ユーザープロフィールが初期化される
- **THEN** 在室ステータスは `OFF_CAMPUS` に設定される

#### Scenario: Transition to in-lab on check-in

- **WHEN** ユーザーが入室 API を正常に完了する
- **THEN** 在室ステータスは `IN_LAB` に更新される

#### Scenario: Transition to on-campus via inside-area

- **WHEN** ユーザーが学内ステータス API を成功させる
- **THEN** 在室ステータスは `ON_CAMPUS` に更新され、アクティブな入室記録がある場合はチェックアウトが完了する

#### Scenario: Transition to off-campus on check-out

- **WHEN** ユーザーが退室 API を正常に完了する
- **THEN** 在室ステータスは `OFF_CAMPUS` に更新される

### Requirement: Inside Area Attendance API

システム SHALL 認証済みユーザーが自分の在室ステータスを「学内」に切り替えるための `POST /api/attendance/inside-area` エンドポイントを提供する。

#### Scenario: Authorized update

- **WHEN** ログイン中のユーザーが `POST /api/attendance/inside-area` にリクエストする
- **THEN** レスポンスは 200 を返し、在室ステータスを `ON_CAMPUS` に更新した結果を JSON で返す

#### Scenario: Requires authentication

- **WHEN** 未認証のクライアントが `POST /api/attendance/inside-area` にリクエストする
- **THEN** レスポンスは 401 を返し、在室ステータスは変更されない

#### Scenario: Handles missing profile

- **WHEN** 認証済みでもプロフィールが存在しないユーザーがリクエストする
- **THEN** レスポンスは 404 を返し、在室ステータスは変更されない

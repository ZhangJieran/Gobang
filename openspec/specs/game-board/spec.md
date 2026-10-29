# game-board Specification

## Purpose

渲染五子棋棋盘并处理玩家的交互操作，包括在交叉点落子、黑白棋子显示、落子序号标记、最后落子高亮以及黑棋禁手点的可视化提示。

## Requirements

### Requirement: Board renders 15x15 grid

系统 SHALL 渲染一个 15x15 的标准五子棋棋盘，包含网格线和交叉点。

#### Scenario: Board displayed on load

- **WHEN** 游戏页面加载完成
- **THEN** 显示 15x15 的棋盘网格，交叉点清晰可辨

### Requirement: Place stone on empty intersection

系统 SHALL 允许玩家在空的交叉点上放置黑子，已被占用的交叉点不可再次落子。

#### Scenario: Click empty intersection

- **WHEN** 玩家点击一个空的交叉点
- **THEN** 该位置放置一颗黑子

#### Scenario: Click occupied intersection

- **WHEN** 玩家点击一个已有棋子的交叉点
- **THEN** 不执行落子，棋盘保持不变

### Requirement: Show move sequence numbers

系统 SHALL 在每颗棋子上显示落子的序号（第几步）。

#### Scenario: Stones show numbers

- **WHEN** 棋盘上有已落的棋子
- **THEN** 每颗棋子上显示其落子序号（从 1 开始递增）

### Requirement: Highlight last move

系统 SHALL 对最后一步落子进行明显标记，便于玩家识别。

#### Scenario: Last move highlighted

- **WHEN** 玩家或 AI 完成一步落子
- **THEN** 该棋子以特殊样式高亮显示

### Requirement: Indicate forbidden points for black

系统 SHALL 在棋盘上标记出黑棋的禁手点位置，帮助玩家规避。

#### Scenario: Forbidden points shown

- **WHEN** 轮到黑棋落子且存在禁手点
- **THEN** 棋盘上以可辨识的样式标记所有禁手点

### Requirement: Block input during AI turn

系统 SHALL 在 AI 回合禁止玩家落子操作。

#### Scenario: Click during AI turn

- **WHEN** 正处于 AI 思考或落子回合
- **THEN** 玩家的点击操作不产生落子

# Spec Delta

## Purpose

实现五子棋的核心规则引擎，包括胜负判定、禁手检测以及游戏状态管理。

## ADDED Requirements

### Requirement: Detect five-in-a-row win

系统 SHALL 在任意一方在横、竖、斜方向连成 5 颗同色棋子时判定该方获胜。

#### Scenario: Black wins horizontally

- **WHEN** 黑棋在水平方向连成 5 子
- **THEN** 判定黑棋获胜，游戏结束

#### Scenario: White wins vertically

- **WHEN** 白棋在垂直方向连成 5 子
- **THEN** 判定白棋获胜，游戏结束

#### Scenario: Win on diagonal

- **WHEN** 任意一方在对角线方向连成 5 子
- **THEN** 判定该方获胜，游戏结束

### Requirement: Detect black forbidden moves

系统 SHALL 检测黑棋的禁手：三三禁手、四四禁手、长连禁手（6 子及以上连珠）。

#### Scenario: Double-three forbidden

- **WHEN** 黑棋某步落子同时形成两个活三
- **THEN** 该落子位置被判定为禁手点

#### Scenario: Double-four forbidden

- **WHEN** 黑棋某步落子同时形成两个四
- **THEN** 该落子位置被判定为禁手点

#### Scenario: Overline forbidden

- **WHEN** 黑棋某步落子形成 6 子或以上连珠
- **THEN** 该落子位置被判定为禁手点

### Requirement: Block black forbidden placement

系统 SHALL 阻止黑棋在禁手点落子。

#### Scenario: Black attempts forbidden move

- **WHEN** 黑棋尝试在禁手点落子
- **THEN** 落子被阻止，游戏状态不变

### Requirement: Alternate turns starting with black

系统 SHALL 从黑棋开始，双方轮流落子。

#### Scenario: Black moves first

- **WHEN** 游戏开始
- **THEN** 黑棋先行第一步

#### Scenario: Turn alternates

- **WHEN** 一方完成落子
- **THEN** 切换到另一方回合

### Requirement: Support undo

系统 SHALL 支持悔棋，撤销最近一步落子并回退到上一步状态。

#### Scenario: Undo last move

- **WHEN** 玩家触发悔棋操作
- **THEN** 最近一步落子被撤销，回合回退到上一步的执棋方

### Requirement: Support restart

系统 SHALL 支持重新开始，将棋盘重置为初始空状态。

#### Scenario: Restart game

- **WHEN** 玩家触发重新开始操作
- **THEN** 棋盘清空，黑棋重新先行

### Requirement: Detect draw

系统 SHALL 在棋盘已满且无任何一方获胜时判定为平局。

#### Scenario: Board full with no winner

- **WHEN** 棋盘所有交叉点都被占满且无人连成 5 子
- **THEN** 判定为平局，游戏结束

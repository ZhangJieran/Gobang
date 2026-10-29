# ai-opponent Specification

## Purpose

为五子棋游戏提供 AI 对手，由 AI 执白棋，基于对空交叉点的棋型启发式评估（兼顾进攻与防守）自动选择最优落子位置，并模拟思考延迟使交互更自然。

## Requirements

### Requirement: AI plays as white

系统 SHALL 由 AI 执白棋，与执黑棋的玩家对弈。

#### Scenario: AI is white

- **WHEN** 游戏开始
- **THEN** AI 执白棋，玩家执黑棋

### Requirement: AI selects move by heuristic evaluation

系统 SHALL 由 AI 使用棋型启发式评估算法选择最优落子位置。

#### Scenario: AI chooses best position

- **WHEN** 轮到 AI 落子
- **THEN** AI 基于当前棋盘的棋型评分选择得分最高的空位落子

### Requirement: AI only places on empty intersections

系统 SHALL 确保 AI 只在空的交叉点落子。

#### Scenario: AI avoids occupied points

- **WHEN** AI 计算落子位置
- **THEN** AI 只从空交叉点中选择目标位置

### Requirement: AI simulates thinking delay

系统 SHALL 在 AI 落子前模拟一段思考延迟，使交互更自然。

#### Scenario: AI thinks before moving

- **WHEN** 轮到 AI 落子
- **THEN** AI 显示思考状态并延迟约 0.5 至 1 秒后落子

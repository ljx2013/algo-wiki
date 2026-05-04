---
title: P1001 A+B Problem
category: 入门题解
difficulty: 入门
tags:
  - 基础
  - 输入输出
date: 2024-01-15
source: 洛谷
---

## 题目描述

输入两个整数 a, b，输出它们的和。

## 解题思路

这是一道入门级别的题目，主要考察基本的输入输出和加法运算。

### 算法步骤

1. 读取输入的两个整数 a 和 b
2. 计算 c = a + b
3. 输出 c

## 参考代码

```cpp
#include <iostream>
using namespace std;

int main() {
    long long a, b;
    cin >> a >> b;
    cout << a + b << endl;
    return 0;
}
```

```python
a = int(input())
b = int(input())
print(a + b)
```

## 复杂度分析

- **时间复杂度**: O(1)
- **空间复杂度**: O(1)

## 注意事项

- 注意整数范围，建议使用 `long long` 类型
- Python 用户可以直接使用 `int()` 转换
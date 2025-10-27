import React from 'react';
import { render } from '@testing-library/react-native';
import LevelModal from '../src/components/LevelModal';

describe('LevelModal', () => {
  it('shows reward for milestone level 3 when highlighted', () => {
    const { getByText } = render(
      <LevelModal
        visible={true}
        currentLevel={2}
        highlightedLevel={3}
        lastColoredLevel={1}
        modalInfo={{ success: true, title: 'Level 3' }}
        onClose={() => {}}
      />
    );

    expect(getByText('+10 💰')).toBeTruthy();
  });
});

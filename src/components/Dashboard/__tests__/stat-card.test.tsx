/** @jest-environment jsdom */

import { render, screen } from '@testing-library/react'

import StatCard from '@/components/Dashboard/StatCard'

describe('StatCard', () => {
  it('renders label, value, and helper text for dashboard summaries', () => {
    render(
      <StatCard
        label="Ativos totais"
        value="12"
        helper="Quantidade total de ativos do projeto."
      />,
    )

    expect(screen.getByText('Ativos totais')).toBeTruthy()
    expect(screen.getByText('12')).toBeTruthy()
    expect(screen.getByText('Quantidade total de ativos do projeto.')).toBeTruthy()
  })
})

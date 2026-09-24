<?php

namespace App\Ai\Agents;

use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\Conversational;
use Laravel\Ai\Contracts\HasTools;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Messages\Message;
use Laravel\Ai\Promptable;
use Stringable;

class ChatAgent implements Agent, Conversational, HasTools
{
    use Promptable;

    /**
     * @param  array<int, array<string, mixed>>  $foodItems
     * @param  array<int, array{role: string, content: string}>  $conversationMessages
     */
    public function __construct(
        protected array $foodItems = [],
        protected array $conversationMessages = [],
    ) {}

    /**
     * Get the instructions that the agent should follow.
     */
    public function instructions(): Stringable|string
    {
        $menu = collect($this->foodItems)
            ->map(function (array $foodItem): string {
                $category = data_get($foodItem, 'sub_category.title', 'Uncategorized');
                $tags = implode(', ', data_get($foodItem, 'tags', []));

                return sprintf(
                    '- %s (NPR %s): %s. Category: %s. Tags: %s.',
                    $foodItem['title'],
                    $foodItem['price'],
                    $foodItem['description'] ?: 'No description available',
                    $category,
                    $tags ?: 'none',
                );
            })
            ->implode("\n");

        return <<<PROMPT
        You are the LTU Food ordering assistant.
        Help customers choose one food item using only the available menu below.
        Be friendly, concise, and honest. Do not invent dishes, prices, ingredients,
        availability, or discounts. If a customer asks to place an order, explain
        that they can add the recommended item from the menu.
        For every recommendation, suggest exactly ONE menu item. Never list,
        compare, or mention alternative food items. Explain briefly why that
        single item matches the customer's request, and use its exact menu name.

        Available menu:
        {$menu}
        PROMPT;
    }

    /**
     * Get the list of messages comprising the conversation so far.
     *
     * @return Message[]
     */
    public function messages(): iterable
    {
        return collect($this->conversationMessages)
            ->map(fn (array $message): Message => new Message(
                $message['role'],
                $message['content'],
            ))
            ->all();
    }

    /**
     * Get the tools available to the agent.
     *
     * @return Tool[]
     */
    public function tools(): iterable
    {
        return [];
    }
}
